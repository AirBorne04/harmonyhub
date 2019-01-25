import * as _ from 'lodash';
import { ActivityAccessory } from './activity-accessory';
import { HubConnection } from './hub-connection';

export class Hub {

  connection: HubConnection;
  log: any;

  accessories: Array<ActivityAccessory>;

  constructor(log, connection?: HubConnection) {
    this.connection = connection;
    this.log = log;
  }

  updateConnection(connection) {
    this.connection = connection;
    _.forEach(this.accessories, (acc) => {
      if (acc.updateConnection) {
        acc.updateConnection(connection);
      }
    });
  }

  getAccessoriesAsync() {
    if (this.accessories) {
      return Promise.resolve(this.accessories);
    }
    return this.updateAccessories();
  }

  async updateAccessories(cachedAccessories?) {
    // var self = this;
    const conn = this.connection;

    const activityCachedAcc = _.find(cachedAccessories, (acc) => acc.context.typeKey = ActivityAccessory.typeKey);

    let activityAcc: ActivityAccessory = _.filter(this.accessories, (a: any) => (a instanceof ActivityAccessory))
                                          .map((a: ActivityAccessory) => a as ActivityAccessory);

    if (!activityAcc) {
      activityAcc = new ActivityAccessory(activityCachedAcc, this.log, conn);
    }

    await activityAcc.initConnection();
    this.accessories = [activityAcc];

    return this.accessories;
  }
}
