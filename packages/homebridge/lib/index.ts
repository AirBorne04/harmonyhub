import { AccessoryBaseInit } from './accessory-base';
import { ActivityAccessoryInit } from './activity-accessory';
import { HomePlatform } from './home-platform';
import { Hub } from './hub';
import { HubAccessoryBaseInit } from './hub-accessory-base';

export = (homebridge) => {
  // Service = homebridge.hap.Service;
  // Characteristic = homebridge.hap.Characteristic;
  // Accessory = homebridge.hap.Accessory;
  // uuid = homebridge.hap.uuid;
  const exportedTypes: any = {
    Service: homebridge.hap.Service,
    Characteristic: homebridge.hap.Characteristic,
    Accessory: homebridge.hap.Accessory,
    PlatformAccessory: homebridge.platformAccessory,
    uuid: homebridge.hap.uuid
  };
  exportedTypes.AccessoryBase = AccessoryBaseInit(exportedTypes);
  exportedTypes.HubAccessoryBase = HubAccessoryBaseInit(exportedTypes);
  exportedTypes.ActivityAccessory = ActivityAccessoryInit(exportedTypes);
  exportedTypes.Hub = Hub;
  exportedTypes.HomePlatform = HomePlatform;

  homebridge.registerPlatform('homebridge-harmonyhub', 'HarmonyHub', exportedTypes.HomePlatform, true);
};
