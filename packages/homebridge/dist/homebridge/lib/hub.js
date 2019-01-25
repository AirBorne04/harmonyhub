"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    updateAccessories(cachedAccessories) {
        return __awaiter(this, void 0, void 0, function* () {
            // var self = this;
            const conn = this.connection;
            const activityCachedAcc = _.find(cachedAccessories, (acc) => acc.context.typeKey = activity_accessory_1.ActivityAccessory.typeKey);
            let activityAcc = _.filter(this.accessories, (a) => (a instanceof activity_accessory_1.ActivityAccessory))
                .map((a) => a);
            if (!activityAcc) {
                activityAcc = new activity_accessory_1.ActivityAccessory(activityCachedAcc, this.log, conn);
            }
            yield activityAcc.initConnection();
            this.accessories = [activityAcc];
            return this.accessories;
        });
    }
}
exports.Hub = Hub;
