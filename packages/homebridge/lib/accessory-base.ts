/**
 * Base class for all accessories in this plugin
 */

var Accessory, Service, Characteristic, uuid;

export function AccessoryBaseInit(exportedTypes) {
	if (exportedTypes && !Accessory) {
		Accessory = exportedTypes.PlatformAccessory || exportedTypes.Accessory;
		Service = exportedTypes.Service;
		Characteristic = exportedTypes.Characteristic;
		uuid = exportedTypes.uuid;
	}
	return AccessoryBase;
};

export class AccessoryBase {

  log;
  accessory: any;

  constructor(accessory, idKey, name, log) {
    this.log = log;

    if (!accessory) {
      var id = uuid.generate(idKey);
      accessory = new Accessory(name, id);
      accessory.name = name;
      accessory.uuid_base = id;
      if (!accessory.getServices) {
        accessory.getServices = getServices.bind(accessory);
      }
    }
    this.accessory = accessory;

    this.accessory.getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, "Logitech")
      .setCharacteristic(Characteristic.Model, "Harmony");
  }

  getService(info: any) {
    this.accessory.getService(info);
  }
  
}

var getServices = function() {
  return this.services;
};