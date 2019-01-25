import autobind from 'autobind-decorator';

import { HubAccessoryBase } from './hub-accessory-base';
import { HubConnection, HubConnectionEvents, HubConnectionStatus } from './hub-connection';

import * as _ from 'lodash';
import { HarmonyClient } from '../../client-ws/lib/harmonyclient';

let Service, Characteristic;

export function ActivityAccessoryInit(exportedTypes) {
  if (exportedTypes && !Service) {
    Service = exportedTypes.Service;
    Characteristic = exportedTypes.Characteristic;
    ActivityService.UUID = Service.Switch.UUID;
  }
  return ActivityAccessory;
}

export const ActivityStatus = {
  Off: 0,
  Starting: 1,
  Started: 2,
  TurningOff: 3
};

@autobind
export class ActivityAccessory extends HubAccessoryBase {

  static typeKey = 'activity';

  currentActivity: any;

  constructor(accessory, log, connection) {
    super(accessory, connection, ActivityAccessory.typeKey, null, log);
  }

  static async createAsync(accessory, log, connection) {
    const acc = new ActivityAccessory(accessory, log, connection);
    await acc.initConnection();
    return acc;
  }

  onConnectionChanged(connStatus) {
    if (connStatus === HubConnectionStatus.CONNECTED) {
      // TODO: Refresh Activity List
      this.refreshActivityAsync();
    }
  }

  onStateChanged(args: HarmonyClient.StateDigest) {
    const stateDigest = args,
          activityId = stateDigest && stateDigest.activityId;
    this._updateActivityState(activityId);
  }

  async initConnection(): Promise<void> {
    if (!super.connection) {
      return;
    }

    super.log('Fetching Logitech Harmony activities...');

    const client = await super.connection.getClient();

    return Promise.all([
        client.getActivities(),
        client.getCurrentActivity()
      ])
      .then((valueArr) => {
        const activities = valueArr[0], currentActivity = valueArr[1];

        super.log('Found activities: \n' + activities.map((a) => {
          return '\t' + a.label;
        }).join('\n'));

        this._updateActivities(activities);
        this._updateActivityState(currentActivity);
      })
      .catch((err) => {
        super.log('Unable to get current activity with error', err);
        throw err;
      });
  }

  updateConnection(connection: HubConnection) {
    const oldConn = this.connection,
          rtn = super.updateConnection(connection),
          newConn = this.connection;

    if (oldConn !== newConn) {
      if (oldConn) {
        oldConn.removeListener(HubConnectionEvents.CONNECTION_CHANGED, this.onConnectionChanged);
        oldConn.removeListener(HubConnectionEvents.STATE_DIGEST, this.onStateChanged);
      }
      if (newConn) {
        newConn.addListener(HubConnectionEvents.CONNECTION_CHANGED, this.onConnectionChanged);
        newConn.addListener(HubConnectionEvents.STATE_DIGEST, this.onStateChanged);
      }
    }

    return rtn;
  }

  _updateActivities(list) {
    const self = this;
    const filteredActivities = _.filter(list, isNotPowerOffActivity),
          activities = _.sortBy(filteredActivities, 'label'),
          actAccList = this._getActivityServices();

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

  _updateActivityState(currentActivity?: string) {
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

  refreshActivityAsync(): Promise<void | any> {
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
    if (!this.accessory) { return null; }
    // TODO: Use matchesActivityForService
    const activityId = getActivityId(activity);
    if (activityId == null) { return null; }
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
    if (service._isAccBound) { return; }

    const c = service.getCharacteristic(Characteristic.On);
    c.on('set', this._setActivityServiceOn.bind(this, service));

    service._isAccBound = true;
  }

  _setActivityServiceOn(service, isOn, callback, doIgnore) {
    if (doIgnore === true) {
      callback();
      return;
    }

    const actId = isOn ? getServiceActivityId(service) : '-1',
          c = service.getCharacteristic(Characteristic.On);

    const finish = () => {
      const cb = callback;
      callback = null;
      c.removeListener('change', onChange);
      if (cb) { cb.apply(this, arguments); }
    };

    const onChange = (args) => {
      if (args.newValue !== isOn) { return; }
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
}

/**
 * Activity Service
 * @param activity
 * @constructor
 */
class ActivityService {

  static UUID: string;

  static isInstance(service){
    return ((service instanceof ActivityService) || (ActivityService.UUID === service.UUID)) &&
      (service.subtype != null);
  }

  constructor(activity) {
    Service.Switch.call(this, activity.label, getActivityId(activity));
    this.updateActivity(activity);
  }

  activityId(service) {
    if (!service) { service = this; }
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
  matchesActivity(activity): boolean {
    return matchesActivityForService(this, activity);
  }
}

const getServiceActivityId = (service) => {
  if (!service) {
    service = this;
  }
  return getActivityId(service.activity) || service.subtype;
};

const matchesActivityForService = (service, activity): boolean => {
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
