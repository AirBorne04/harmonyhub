"use strict";
const accessory_base_1 = require("./accessory-base");
const activity_accessory_1 = require("./activity-accessory");
const home_platform_1 = require("./home-platform");
const hub_1 = require("./hub");
const hub_accessory_base_1 = require("./hub-accessory-base");
module.exports = (homebridge) => {
    // Service = homebridge.hap.Service;
    // Characteristic = homebridge.hap.Characteristic;
    // Accessory = homebridge.hap.Accessory;
    // uuid = homebridge.hap.uuid;
    const exportedTypes = {
        Service: homebridge.hap.Service,
        Characteristic: homebridge.hap.Characteristic,
        Accessory: homebridge.hap.Accessory,
        PlatformAccessory: homebridge.platformAccessory,
        uuid: homebridge.hap.uuid
    };
    exportedTypes.AccessoryBase = accessory_base_1.AccessoryBaseInit(exportedTypes);
    exportedTypes.HubAccessoryBase = hub_accessory_base_1.HubAccessoryBaseInit(exportedTypes);
    exportedTypes.ActivityAccessory = activity_accessory_1.ActivityAccessoryInit(exportedTypes);
    exportedTypes.Hub = hub_1.Hub;
    exportedTypes.HomePlatform = home_platform_1.HomePlatform;
    homebridge.registerPlatform('homebridge-harmonyhub', 'HarmonyHub', exportedTypes.HomePlatform, true);
};
