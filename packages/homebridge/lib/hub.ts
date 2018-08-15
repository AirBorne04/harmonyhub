import * as _ from "lodash";
import { HubConnection } from "./hub-connection";
import { ActivityAccessory } from "./activity-accessory";


export class Hub {

  connection: HubConnection;
  log: any;

  _accessories: any;

  constructor(log, connection?: HubConnection) {
    this.connection = connection;
    this.log = log;
  }

  updateConnection(connection) {
    this.connection = connection;
    _.forEach(this._accessories, function(acc){
      if (acc.updateConnection) {
        acc.updateConnection(connection);
      }
    });
  }

  getAccessoriesAsync() {
    if (this._accessories) {
      return Promise.resolve(this._accessories);
    }
    return this.updateAccessoriesAsync();
  }

  updateAccessoriesAsync(cachedAccessories?) {
    var self = this;
    var conn = this.connection;

    var activityCachedAcc = _.find(cachedAccessories, function (acc) {
      return acc.context.typeKey = ActivityAccessory.typeKey;
    });
    var activityAcc = _.find(this._accessories, function (a) { return a instanceof ActivityAccessory; });
    if (!activityAcc) {
      activityAcc = new ActivityAccessory(activityCachedAcc, this.log, conn);
    }
    var activityTask = activityAcc.initAsync().return(activityAcc);

    return Promise.all([
        activityTask
      ])
      .then(function(accessories){
        self._accessories = accessories;
        return accessories;
      });
  }
}