"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ActivityAccessory_1;
const autobind_decorator_1 = require("autobind-decorator");
const hub_accessory_base_1 = require("./hub-accessory-base");
const hub_connection_1 = require("./hub-connection");
var _ = require('lodash');
var Service, Characteristic;
function ActivityAccessoryInit(exportedTypes) {
    if (exportedTypes && !Service) {
        Service = exportedTypes.Service;
        Characteristic = exportedTypes.Characteristic;
        ActivityService.UUID = Service.Switch.UUID;
    }
    return ActivityAccessory;
}
exports.ActivityAccessoryInit = ActivityAccessoryInit;
;
exports.ActivityStatus = {
    Off: 0,
    Starting: 1,
    Started: 2,
    TurningOff: 3
};
let ActivityAccessory = ActivityAccessory_1 = class ActivityAccessory extends hub_accessory_base_1.HubAccessoryBase {
    constructor(accessory, log, connection) {
        super(accessory, connection, ActivityAccessory_1.typeKey, null, log);
    }
    static createAsync(accessory, log, connection) {
        var acc = new ActivityAccessory_1(accessory, log, connection);
        return acc.initAsync().then(() => acc);
    }
    onConnectionChanged(connStatus) {
        if (connStatus == hub_connection_1.HubConnectionStatus.Connected) {
            //TODO: Refresh Activity List
            this.refreshActivityAsync();
        }
    }
    onStateChanged(args) {
        var stateDigest = args.stateDigest;
        var activityId = stateDigest && stateDigest.activityId;
        this._updateActivityState(activityId);
    }
    initAsync() {
        if (!super.connection) {
            return Promise.resolve();
        }
        super.log("Fetching Logitech Harmony activities...");
        return Promise.all([
            super.connection.getClient().then(client => {
                return client.getActivities();
            }),
            super.connection.getClient().then(client => {
                return client.getCurrentActivity();
            })
        ])
            .then(valueArr => {
            var activities = valueArr[0], currentActivity = valueArr[1];
            super.log("Found activities: \n" + activities.map(function (a) {
                return "\t" + a.label;
            }).join("\n"));
            this._updateActivities(activities);
            this._updateActivityState(currentActivity);
        })
            .catch((err) => {
            super.log('Unable to get current activity with error', err);
            throw err;
        });
    }
    updateConnection(connection) {
        var oldConn = this.connection;
        var rtn = super.updateConnection(connection);
        var newConn = this.connection;
        if (oldConn != newConn) {
            if (oldConn) {
                oldConn.removeListener(hub_connection_1.HubConnectionEvents.ConnectionChanged, this.onConnectionChanged);
                oldConn.removeListener(hub_connection_1.HubConnectionEvents.StateDigest, this.onStateChanged);
            }
            if (newConn) {
                newConn.addListener(hub_connection_1.HubConnectionEvents.ConnectionChanged, this.onConnectionChanged);
                newConn.addListener(hub_connection_1.HubConnectionEvents.StateDigest, this.onStateChanged);
            }
        }
        return rtn;
    }
    _updateActivities(list) {
        var self = this;
        var filteredActivities = _.filter(list, isNotPowerOffActivity);
        var activities = _.sortBy(filteredActivities, 'label');
        var actAccList = this._getActivityServices();
        if (!_.isEmpty(actAccList)) {
            var invalidActivityServices = _.differenceWith(actAccList, activities, function (service, activity) {
                return matchesActivityForService(service, activity);
            });
            _.forEach(invalidActivityServices, function (service) {
                self.accessory.removeService(service);
            });
            _.forEach(actAccList, self._bindService.bind(self));
        }
        _.forEach(activities, function (activity) {
            var service = self._getActivityService(activity);
            if (service == null) {
                return;
            }
            this.updateActivityForService(service, activity);
        });
        this._updateActivityState();
    }
    _updateActivityState(currentActivity) {
        if (currentActivity == null) {
            currentActivity = this._currentActivity;
        }
        else {
            this._currentActivity = currentActivity;
        }
        _.forEach(this._getActivityServices(), function (service) {
            var val = getServiceActivityId(service) == currentActivity;
            service.getCharacteristic(Characteristic.On).setValue(val, null, true);
        });
    }
    refreshActivityAsync() {
        return this.connection.getClient()
            .then(client => {
            return client.getCurrentActivity();
        })
            .then(this._updateActivityState)
            .catch(err => {
            this.log("Unable to get current activity with error", err);
            throw err;
        });
    }
    _getActivityService(activity) {
        if (!this.accessory)
            return null;
        //TODO: Use matchesActivityForService
        var activityId = getActivityId(activity);
        if (activityId == null)
            return null;
        var service = _.find(this._getActivityServices(), function (service) {
            return getServiceActivityId(service) == activityId;
        });
        if (!service && isActivityInfo(activity)) {
            service = this.accessory.addService(ActivityService, activity);
            this._bindService(service);
        }
        return service;
    }
    _getActivityServices() {
        return _.filter(this.accessory && this.accessory.services, ActivityService.isInstance);
    }
    _bindService(service) {
        if (service._isAccBound)
            return;
        var c = service.getCharacteristic(Characteristic.On);
        c.on('set', this._setActivityServiceOn.bind(this, service));
        service._isAccBound = true;
    }
    _setActivityServiceOn(service, isOn, callback, doIgnore) {
        if (doIgnore == true) {
            callback();
            return;
        }
        var actId = isOn ? getServiceActivityId(service) : '-1';
        var c = service.getCharacteristic(Characteristic.On);
        var finish = () => {
            var cb = callback;
            callback = null;
            c.removeListener('change', onChange);
            if (cb)
                cb.apply(this, arguments);
        };
        var onChange = (args) => {
            if (args.newValue != isOn)
                return;
            this.log.debug("Preemptively marking finished.");
            finish();
        };
        return this.connection.getClient()
            .then(client => {
            this.log.debug("Switching to Activity: " + actId);
            c.addListener("change", onChange);
            var task = client.startActivity(actId);
            this.log.debug("Switching Task Started: " + actId);
            return task;
        })
            .then(finish)
            .then(() => {
            this.log.debug("Switch Task Finished: " + actId);
        });
    }
};
ActivityAccessory.typeKey = 'activity';
ActivityAccessory = ActivityAccessory_1 = __decorate([
    autobind_decorator_1.default
], ActivityAccessory);
exports.ActivityAccessory = ActivityAccessory;
/**
 * Activity Service
 * @param activity
 * @constructor
 */
class ActivityService {
    static isInstance(service) {
        return ((service instanceof ActivityService) || (ActivityService.UUID === service.UUID)) &&
            (service.subtype != null);
    }
    constructor(activity) {
        Service.Switch.call(this, activity.label, getActivityId(activity));
        this.updateActivity(activity);
    }
    activityId(service) {
        if (!service)
            service = this;
        return getActivityId(service.activity) || service.subtype;
    }
    updateActivity(activity) {
        return this.updateActivityForService(this, activity);
    }
    //TODO: Make all activity services ActivityService (aka cached services)
    updateActivityForService(service, activity) {
        service.activity = activity;
        service.setCharacteristic(Characteristic.Name, activity.label);
    }
    //TODO: Make all activity services ActivityService (aka cached services)
    matchesActivity(activity) {
        return matchesActivityForService(this, activity);
    }
}
var getServiceActivityId = function (service) {
    if (!service) {
        service = this;
    }
    return getActivityId(service.activity) || service.subtype;
};
var matchesActivityForService = function (service, activity) {
    var activityId = getActivityId(activity);
    return activityId != null && getServiceActivityId(service) == activityId;
};
var isActivityInfo = function (activity) {
    return activity != null && activity.id != null;
};
var getActivityId = function (activity) {
    return isActivityInfo(activity) ? activity.id : activity;
};
var isNotPowerOffActivity = function (activity) {
    var activityId = getActivityId(activity);
    return activityId != null && activityId > 0;
};
