import autobind from "autobind-decorator";
import { AccessoryBase } from "./accessory-base";
import { HubConnection, HubConnectionEvents, HubConnectionStatus } from "./hub-connection";

var Service, Characteristic;

export function HubAccessoryBaseInit(exportedTypes) {
	if (exportedTypes && !Service) {
		Service = exportedTypes.Service;
		Characteristic = exportedTypes.Characteristic;
	}
	return HubAccessoryBase;
};

function getHubId(connection: HubConnection, accessory): string {
  var hubId;
  if (connection) {
    hubId = connection.hubInfo.uuid;
  } else if (accessory && accessory.context) {
    hubId = accessory.context.hubId;
  }

  return hubId;
}

function getHubInfo(connection:HubConnection, accessory): any {
  var hubInfo;
  if (connection) {
    hubInfo = connection.hubInfo;
  } else if (accessory && accessory.context) {
    hubInfo = accessory.context.hubInfo;
  }

  return hubInfo;
}

@autobind
export class HubAccessoryBase extends AccessoryBase {

  connection: HubConnection;
 

  constructor(accessory, connection: HubConnection, idKey, name, log) {
    super(
      accessory,
      getHubId(connection, accessory) + idKey,
      name || (getHubInfo(connection, accessory) && getHubInfo(connection, accessory).friendlyName),
      log
    );

    log("initing got " + accessory);
    this.updateConnection(connection);
  }

  updateConnection(connection: HubConnection) {
    var oldConn = this.connection;
    this.connection = connection;
    this.refreshHubInfo();
  
    if (oldConn != connection) {
      if (oldConn) {
        oldConn.removeListener(HubConnectionEvents.ConnectionChanged, this._refreshConnection);
      }
      if (connection) {
        connection.addListener(HubConnectionEvents.ConnectionChanged, this._refreshConnection);
      }
    }
  
    this._refreshConnection(connection ? connection.status : null)
  }

  _refreshConnection(connStatus: HubConnectionStatus) {
    var reachable = connStatus != null && connStatus == HubConnectionStatus.Connected;
    this.accessory.updateReachability(reachable);
    this.log.debug("Updated reachability of " + this.connection.hubInfo.uuid + " to " + reachable);
  }

  refreshHubInfo() {
    var hubInfo: any = (this.connection && this.connection.hubInfo) || {};
  
    var ctx = this.accessory.context || (this.accessory.context = {});
    ctx.hubInfo = hubInfo;
    ctx.hubId = this.connection && this.connection.hubInfo.uuid;
  
    var infoSvc = this.accessory.getService(Service.AccessoryInformation);
    setIfNeeded(infoSvc, Characteristic.FirmwareRevision, hubInfo.current_fw_version, '');
  }
}


var setIfNeeded = function(svc, characteristic, value, defaultValue) {
	if (value == null && !svc.testCharacteristic(characteristic)) return;
	svc.setCharacteristic(characteristic, value != null ? value : defaultValue);
};