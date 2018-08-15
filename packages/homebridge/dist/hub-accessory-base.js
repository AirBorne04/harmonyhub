"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const autobind_decorator_1 = require("autobind-decorator");
const accessory_base_1 = require("./accessory-base");
const hub_connection_1 = require("./hub-connection");
var Service, Characteristic;
function HubAccessoryBaseInit(exportedTypes) {
    if (exportedTypes && !Service) {
        Service = exportedTypes.Service;
        Characteristic = exportedTypes.Characteristic;
    }
    return HubAccessoryBase;
}
exports.HubAccessoryBaseInit = HubAccessoryBaseInit;
;
function getHubId(connection, accessory) {
    var hubId;
    if (connection) {
        hubId = connection.hubInfo.uuid;
    }
    else if (accessory && accessory.context) {
        hubId = accessory.context.hubId;
    }
    return hubId;
}
function getHubInfo(connection, accessory) {
    var hubInfo;
    if (connection) {
        hubInfo = connection.hubInfo;
    }
    else if (accessory && accessory.context) {
        hubInfo = accessory.context.hubInfo;
    }
    return hubInfo;
}
let HubAccessoryBase = class HubAccessoryBase extends accessory_base_1.AccessoryBase {
    constructor(accessory, connection, idKey, name, log) {
        super(accessory, getHubId(connection, accessory) + idKey, name || (getHubInfo(connection, accessory) && getHubInfo(connection, accessory).friendlyName), log);
        log("initing got " + accessory);
        this.updateConnection(connection);
    }
    updateConnection(connection) {
        var oldConn = this.connection;
        this.connection = connection;
        this.refreshHubInfo();
        if (oldConn != connection) {
            if (oldConn) {
                oldConn.removeListener(hub_connection_1.HubConnectionEvents.ConnectionChanged, this._refreshConnection);
            }
            if (connection) {
                connection.addListener(hub_connection_1.HubConnectionEvents.ConnectionChanged, this._refreshConnection);
            }
        }
        this._refreshConnection(connection ? connection.status : null);
    }
    _refreshConnection(connStatus) {
        var reachable = connStatus != null && connStatus == hub_connection_1.HubConnectionStatus.Connected;
        this.accessory.updateReachability(reachable);
        this.log.debug("Updated reachability of " + this.connection.hubInfo.uuid + " to " + reachable);
    }
    refreshHubInfo() {
        var hubInfo = (this.connection && this.connection.hubInfo) || {};
        var ctx = this.accessory.context || (this.accessory.context = {});
        ctx.hubInfo = hubInfo;
        ctx.hubId = this.connection && this.connection.hubInfo.uuid;
        var infoSvc = this.accessory.getService(Service.AccessoryInformation);
        setIfNeeded(infoSvc, Characteristic.FirmwareRevision, hubInfo.current_fw_version, '');
    }
};
HubAccessoryBase = __decorate([
    autobind_decorator_1.default
], HubAccessoryBase);
exports.HubAccessoryBase = HubAccessoryBase;
var setIfNeeded = function (svc, characteristic, value, defaultValue) {
    if (value == null && !svc.testCharacteristic(characteristic))
        return;
    svc.setCharacteristic(characteristic, value != null ? value : defaultValue);
};
