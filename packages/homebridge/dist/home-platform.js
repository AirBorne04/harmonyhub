"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const autobind_decorator_1 = require("autobind-decorator");
const events_1 = require("events");
const discover_1 = require("@harmonyhub/discover");
const hub_connection_1 = require("./hub-connection");
const hub_1 = require("./hub");
const accessory_base_1 = require("./accessory-base");
var _ = require('lodash');
// var Promise = require('bluebird');
exports.Events = {
    DiscoveredHubs: 'discoveredHubs'
};
var singleton;
let HomePlatform = class HomePlatform extends events_1.EventEmitter {
    constructor(log, config, api) {
        super();
        this._discoveredHubs = [];
        this._cachedAccessories = [];
        // _hubs = {};
        this._hubMap = new Map();
        //_hubIndex: Array<any> = [];
        this._isInitialized = false;
        this._autoAddNewHubs = false;
        this.log = log;
        if (singleton) {
            log.warn("Ignoring duplicate Harmony Platform.  Only one platform can be defined.  Multi-Hub support is now built into the platform, so multiple definitions are no longer required.");
            this.disabled = true;
            return;
        }
        singleton = this;
        if (!config) {
            log.warn("Ignoring Harmony Platform setup because it is not configured");
            this.disabled = true;
            return;
        }
        if (config.ip_address) {
            log.warn("Specifying ip_address is no longer supported in the platform, so the specified ip_address will be ignored. The platform is designed for auto discovery of all hubs on the network.");
        }
        this._discover = new discover_1.Explorer(61991, {});
        this._discover.on('update', (hubs) => {
            this.log.debug('received update event from harmonyhubjs-discover. there are ' + hubs.length + ' hubs');
            this._discoveredHubs = hubs;
            this._discoveredHubs.forEach(this._handleDiscoveredHubAsync);
            this.emit(exports.Events.DiscoveredHubs, hubs);
        });
        this._discover.start();
        if (api) {
            // Save the API object as plugin needs to register new accessory via this object.
            this._api = api;
            // Listen to event "didFinishLaunching", this means homebridge already finished loading cached accessories
            // Platform Plugin should only register new accessory that doesn't exist in homebridge after this event.
            // Or start discover new accessories
            this._api.on('didFinishLaunching', this._finishInitialization);
        }
    }
    _finishInitialization() {
        return this._finishInitializationAsync()
            .catch(err => {
            this.log.error('Error finishing initialization of HarmonyHub: ' + (err ? (err.stack || err.message || err) : err));
        });
    }
    _finishInitializationAsync() {
        this.log.debug("Finalizing Plugin Launch");
        var accProm = this._cachedAccessories.map((acc) => {
            acc.updateReachability(false);
            var hubId = acc && acc.context && acc.context.hubId;
            if (!hubId) {
                return;
            }
            var hub = this._hubMap.get(hubId);
            if (hub) {
                return;
            }
            hub = new hub_1.Hub(this.log);
            this._hubMap.set(hubId, hub);
            //this._hubIndex.push(hubId);
            return this._refreshHubAccessoriesAsync(hubId, hub, false);
        });
        return Promise.all(accProm)
            .then(() => {
            this._autoAddNewHubs = true;
            return this._discoveredHubs || [];
        })
            .then(hubArr => Promise.all(hubArr.map(this._handleDiscoveredHubAsync)))
            .then(() => {
            return (this._isInitialized = true);
        });
    }
    _handleDiscoveredHubAsync(hubInfo) {
        if (!this._autoAddNewHubs) {
            return;
        }
        var hubId = hubInfo.uuid;
        if (!hubId) {
            return;
        }
        var hub = this._hubMap.get(hubId);
        if (hub && hub.connection) {
            return;
        }
        var conn = new hub_connection_1.HubConnection(hubInfo, this.log, this._discover);
        if (!hub) {
            hub = new hub_1.Hub(this.log, conn);
            this._hubMap.set(hubId, hub);
            // this._hubIndex.push(hubId);
        }
        else {
            hub.updateConnection(conn);
        }
        return conn.connectAsync(hubInfo)
            .then(() => this._refreshHubAccessoriesAsync(hubId, hub, true));
    }
    _refreshHubAccessoriesAsync(hubId, hub, doRegister) {
        var self = this;
        var cachedAccList = self._cachedAccessories.filter(function (acc) {
            return acc && acc.context && acc.context.hubId == hubId;
        });
        var task = hub.updateAccessoriesAsync(cachedAccList);
        if (doRegister) {
            task = task
                .then((accList) => {
                if (!this._api) {
                    return;
                }
                accList = accList.map(function (acc) {
                    return (acc instanceof accessory_base_1.AccessoryBase) ? acc.accessory : acc;
                });
                var newAccList = _.difference(accList, cachedAccList);
                this._api.registerPlatformAccessories("homebridge-harmonyhub", "HarmonyHub", newAccList);
                return accList;
            });
        }
        return task;
    }
    configureAccessory(accessory) {
        if (singleton && singleton != this) {
            return singleton.configureAccessory(accessory);
        }
        if (this.disabled) {
            return false;
        }
        this.log.debug("Plugin - Configure Accessory: " + accessory.displayName);
        if (this._cachedAccessories == null) {
            this._cachedAccessories = [];
        }
        this._cachedAccessories.push(accessory);
    }
};
HomePlatform = __decorate([
    autobind_decorator_1.default
], HomePlatform);
exports.HomePlatform = HomePlatform;
