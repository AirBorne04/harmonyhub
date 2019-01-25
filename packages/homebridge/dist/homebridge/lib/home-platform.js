"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const autobind_decorator_1 = require("autobind-decorator");
const events_1 = require("events");
const discover_1 = require("@harmonyhub/discover");
const accessory_base_1 = require("./accessory-base");
const hub_1 = require("./hub");
const hub_connection_1 = require("./hub-connection");
const _ = require("lodash");
exports.Events = {
    DiscoveredHubs: 'discoveredHubs'
};
let singleton;
let HomePlatform = class HomePlatform extends events_1.EventEmitter {
    constructor(log, config, api) {
        super();
        this.discoveredHubs = [];
        this.cachedAccessories = [];
        // _hubs = {};
        this.hubMap = new Map();
        // _hubIndex: Array<any> = [];
        this.isInitialized = false;
        this.autoAddNewHubs = false;
        this.log = log;
        if (singleton) {
            log.warn('Ignoring duplicate Harmony Platform.  ' +
                'Only one platform can be defined.  ' +
                'Multi-Hub support is now built into the platform, so multiple definitions are no longer required.');
            this.disabled = true;
            return;
        }
        singleton = this;
        if (!config) {
            log.warn('Ignoring Harmony Platform setup because it is not configured');
            this.disabled = true;
            return;
        }
        if (config.ip_address) {
            log.warn('Specifying ip_address is no longer supported in the platform, ' +
                'so the specified ip_address will be ignored. ' +
                'The platform is designed for auto discovery of all hubs on the network.');
        }
        this.discover = new discover_1.Explorer(61991, {});
        this.discover.on(discover_1.Explorer.Events.UPDATE, (hubs) => {
            this.log.debug('received update event from @harmonyhub/discover. there are ' + hubs.length + ' hubs');
            this.discoveredHubs = hubs;
            this.discoveredHubs.forEach(this._handleDiscoveredHub);
            this.emit(exports.Events.DiscoveredHubs, hubs);
        });
        this.discover.start();
        if (api) {
            // Save the API object as plugin needs to register new accessory via this object.
            this.api = api;
            // Listen to event "didFinishLaunching", this means homebridge already finished loading cached accessories
            // Platform Plugin should only register new accessory that doesn't exist in homebridge after this event.
            // Or start discover new accessories
            this.api.on('didFinishLaunching', this._finishInitialization);
        }
    }
    _finishInitialization() {
        return this._finishInitializationAsync()
            .catch((err) => {
            this.log.error('Error finishing initialization of HarmonyHub: ' +
                (err ? (err.stack || err.message || err) : err));
        });
    }
    _finishInitializationAsync() {
        this.log.debug('Finalizing Plugin Launch');
        const accProm = this.cachedAccessories.map((acc) => {
            acc.updateReachability(false);
            const hubId = acc && acc.context && acc.context.hubId;
            if (!hubId) {
                return;
            }
            let hub = this.hubMap.get(hubId);
            if (hub) {
                return;
            }
            hub = new hub_1.Hub(this.log);
            this.hubMap.set(hubId, hub);
            // this._hubIndex.push(hubId);
            return this._refreshHubAccessories(hubId, hub, false);
        });
        return Promise.all(accProm)
            .then(() => {
            this.autoAddNewHubs = true;
            return this.discoveredHubs || [];
        })
            .then((hubArr) => Promise.all(hubArr.map(this._handleDiscoveredHub)))
            .then(() => {
            return (this.isInitialized = true);
        });
    }
    _handleDiscoveredHub(hubInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.autoAddNewHubs) {
                return;
            }
            if (!hubInfo.uuid) {
                return;
            }
            let hub = this.hubMap.get(hubInfo.uuid);
            if (hub && hub.connection) {
                return;
            }
            const conn = new hub_connection_1.HubConnection(hubInfo, this.log, this.discover);
            if (!hub) {
                hub = new hub_1.Hub(this.log, conn);
                this.hubMap.set(hubInfo.uuid, hub);
            }
            else {
                hub.updateConnection(conn);
            }
            return conn.connect(hubInfo).then(() => this._refreshHubAccessories(hubInfo.uuid, hub, true));
        });
    }
    _refreshHubAccessories(hubId, hub, doRegister) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedAccList = this.cachedAccessories.filter((acc) => {
                return acc && acc.context && acc.context.hubId === hubId;
            });
            let accList = yield hub.updateAccessories(cachedAccList);
            if (doRegister) {
                if (!this.api) {
                    return;
                }
                accList = accList.map((acc) => {
                    return (acc instanceof accessory_base_1.AccessoryBase) ? acc.accessory : acc;
                });
                const newAccList = _.difference(accList, cachedAccList);
                this.api.registerPlatformAccessories('homebridge-harmonyhub', 'HarmonyHub', newAccList);
            }
            return accList;
        });
    }
    configureAccessory(accessory) {
        if (singleton && singleton !== this) {
            return singleton.configureAccessory(accessory);
        }
        if (this.disabled) {
            return false;
        }
        this.log.debug('Plugin - Configure Accessory: ' + accessory.displayName);
        if (this.cachedAccessories == null) {
            this.cachedAccessories = [];
        }
        this.cachedAccessories.push(accessory);
    }
};
HomePlatform = __decorate([
    autobind_decorator_1.default
], HomePlatform);
exports.HomePlatform = HomePlatform;
