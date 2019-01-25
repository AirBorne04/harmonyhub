"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var ActivityAccessory_1;
const autobind_decorator_1 = require("autobind-decorator");
const hub_accessory_base_1 = require("./hub-accessory-base");
const hub_connection_1 = require("./hub-connection");
const _ = require("lodash");
let Service, Characteristic;
function ActivityAccessoryInit(exportedTypes) {
    if (exportedTypes && !Service) {
        Service = exportedTypes.Service;
        Characteristic = exportedTypes.Characteristic;
        ActivityService.UUID = Service.Switch.UUID;
    }
    return ActivityAccessory;
}
exports.ActivityAccessoryInit = ActivityAccessoryInit;
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
        return __awaiter(this, void 0, void 0, function* () {
            const acc = new ActivityAccessory_1(accessory, log, connection);
            yield acc.initConnection();
            return acc;
        });
    }
    onConnectionChanged(connStatus) {
        if (connStatus === hub_connection_1.HubConnectionStatus.CONNECTED) {
            // TODO: Refresh Activity List
            this.refreshActivityAsync();
        }
    }
    onStateChanged(args) {
        const stateDigest = args, activityId = stateDigest && stateDigest.activityId;
        this._updateActivityState(activityId);
    }
    initConnection() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            if (!_super("connection")) {
                return;
            }
            _super("log").call(this, 'Fetching Logitech Harmony activities...');
            const client = yield _super("connection").getClient();
            return Promise.all([
                client.getActivities(),
                client.getCurrentActivity()
            ])
                .then((valueArr) => {
                const activities = valueArr[0], currentActivity = valueArr[1];
                _super("log").call(this, 'Found activities: \n' + activities.map((a) => {
                    return '\t' + a.label;
                }).join('\n'));
                this._updateActivities(activities);
                this._updateActivityState(currentActivity);
            })
                .catch((err) => {
                _super("log").call(this, 'Unable to get current activity with error', err);
                throw err;
            });
        });
    }
    updateConnection(connection) {
        const oldConn = this.connection, rtn = super.updateConnection(connection), newConn = this.connection;
        if (oldConn !== newConn) {
            if (oldConn) {
                oldConn.removeListener(hub_connection_1.HubConnectionEvents.CONNECTION_CHANGED, this.onConnectionChanged);
                oldConn.removeListener(hub_connection_1.HubConnectionEvents.STATE_DIGEST, this.onStateChanged);
            }
            if (newConn) {
                newConn.addListener(hub_connection_1.HubConnectionEvents.CONNECTION_CHANGED, this.onConnectionChanged);
                newConn.addListener(hub_connection_1.HubConnectionEvents.STATE_DIGEST, this.onStateChanged);
            }
        }
        return rtn;
    }
    _updateActivities(list) {
        const self = this;
        const filteredActivities = _.filter(list, isNotPowerOffActivity), activities = _.sortBy(filteredActivities, 'label'), actAccList = this._getActivityServices();
        if (!_.isEmpty(actAccList)) {
            const invalidActivityServices = _.differenceWith(actAccList, activities, (service, activity) => {
                return matchesActivityForService(service, activity);
            });
            _.forEach(invalidActivityServices, (service) => {
                self.accessory.removeService(service);
            });
            _.forEach(actAccList, self._bindService.bind(self));
        }
        _.forEach(activities, (activity) => {
            const service = this._getActivityService(activity);
            if (service == null) {
                return;
            }
            activity.updateActivityForService(service, activity);
        });
        this._updateActivityState();
    }
    _updateActivityState(currentActivity) {
        if (currentActivity == null) {
            currentActivity = this.currentActivity;
        }
        else {
            this.currentActivity = currentActivity;
        }
        _.forEach(this._getActivityServices(), (service) => {
            const val = getServiceActivityId(service) === currentActivity;
            service.getCharacteristic(Characteristic.On).setValue(val, null, true);
        });
    }
    refreshActivityAsync() {
        return this.connection.getClient()
            .then((client) => {
            return client.getCurrentActivity();
        })
            .then(this._updateActivityState)
            .catch((err) => {
            this.log('Unable to get current activity with error', err);
            throw err;
        });
    }
    _getActivityService(activity) {
        if (!this.accessory) {
            return null;
        }
        // TODO: Use matchesActivityForService
        const activityId = getActivityId(activity);
        if (activityId == null) {
            return null;
        }
        let service = _.find(this._getActivityServices(), (serv) => {
            return getServiceActivityId(serv) === activityId;
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
        if (service._isAccBound) {
            return;
        }
        const c = service.getCharacteristic(Characteristic.On);
        c.on('set', this._setActivityServiceOn.bind(this, service));
        service._isAccBound = true;
    }
    _setActivityServiceOn(service, isOn, callback, doIgnore) {
        if (doIgnore === true) {
            callback();
            return;
        }
        const actId = isOn ? getServiceActivityId(service) : '-1', c = service.getCharacteristic(Characteristic.On);
        const finish = () => {
            const cb = callback;
            callback = null;
            c.removeListener('change', onChange);
            if (cb) {
                cb.apply(this, arguments);
            }
        };
        const onChange = (args) => {
            if (args.newValue !== isOn) {
                return;
            }
            this.log.debug('Preemptively marking finished.');
            finish();
        };
        return this.connection.getClient()
            .then((client) => {
            this.log.debug(`Switching to Activity: ${actId}`);
            c.addListener('change', onChange);
            const task = client.startActivity(actId);
            this.log.debug(`Switching Task Started: ${actId}`);
            return task;
        })
            .then(finish)
            .then(() => {
            this.log.debug(`Switch Task Finished: ${actId}`);
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
        if (!service) {
            service = this;
        }
        return getActivityId(service.activity) || service.subtype;
    }
    updateActivity(activity) {
        return this.updateActivityForService(this, activity);
    }
    // TODO: Make all activity services ActivityService (aka cached services)
    updateActivityForService(service, activity) {
        service.activity = activity;
        service.setCharacteristic(Characteristic.Name, activity.label);
    }
    // TODO: Make all activity services ActivityService (aka cached services)
    matchesActivity(activity) {
        return matchesActivityForService(this, activity);
    }
}
const getServiceActivityId = (service) => {
    if (!service) {
        service = this;
    }
    return getActivityId(service.activity) || service.subtype;
};
const matchesActivityForService = (service, activity) => {
    const activityId = getActivityId(activity);
    return activityId != null && getServiceActivityId(service) === activityId;
};
const isActivityInfo = (activity) => {
    return activity != null && activity.id != null;
};
const getActivityId = (activity) => {
    return isActivityInfo(activity) ? activity.id : activity;
};
const isNotPowerOffActivity = (activity) => {
    const activityId = getActivityId(activity);
    return activityId != null && activityId > 0;
};
