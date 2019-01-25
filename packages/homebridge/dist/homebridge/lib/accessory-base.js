"use strict";
/**
 * Base class for all accessories in this plugin
 */
Object.defineProperty(exports, "__esModule", { value: true });
let Accessory, Service, Characteristic, uuid;
function AccessoryBaseInit(exportedTypes) {
    if (exportedTypes && !Accessory) {
        Accessory = exportedTypes.PlatformAccessory || exportedTypes.Accessory;
        Service = exportedTypes.Service;
        Characteristic = exportedTypes.Characteristic;
        uuid = exportedTypes.uuid;
    }
    return AccessoryBase;
}
exports.AccessoryBaseInit = AccessoryBaseInit;
class AccessoryBase {
    constructor(accessory, idKey, name, log) {
        this.log = log;
        if (!accessory) {
            const id = uuid.generate(idKey);
            accessory = new Accessory(name, id);
            accessory.name = name;
            accessory.uuid_base = id;
            if (!accessory.getServices) {
                accessory.getServices = getServices.bind(accessory);
            }
        }
        this.accessory = accessory;
        this.accessory.getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Manufacturer, 'Logitech')
            .setCharacteristic(Characteristic.Model, 'Harmony');
    }
    getService(info) {
        this.accessory.getService(info);
    }
}
exports.AccessoryBase = AccessoryBase;
const getServices = function () {
    return this.services;
};
