"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const activity_accessory_1 = require("./activity-accessory");
class Hub {
    constructor(log, connection) {
        this.connection = connection;
        this.log = log;
    }
    updateConnection(connection) {
        this.connection = connection;
        _.forEach(this._accessories, function (acc) {
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
    updateAccessoriesAsync(cachedAccessories) {
        var self = this;
        var conn = this.connection;
        var activityCachedAcc = _.find(cachedAccessories, function (acc) {
            return acc.context.typeKey = activity_accessory_1.ActivityAccessory.typeKey;
        });
        var activityAcc = _.find(this._accessories, function (a) { return a instanceof activity_accessory_1.ActivityAccessory; });
        if (!activityAcc) {
            activityAcc = new activity_accessory_1.ActivityAccessory(activityCachedAcc, this.log, conn);
        }
        var activityTask = activityAcc.initAsync().return(activityAcc);
        return Promise.all([
            activityTask
        ])
            .then(function (accessories) {
            self._accessories = accessories;
            return accessories;
        });
    }
}
exports.Hub = Hub;
