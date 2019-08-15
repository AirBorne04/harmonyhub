"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Explorer_1;
Object.defineProperty(exports, "__esModule", { value: true });
const autobind_decorator_1 = require("autobind-decorator");
const logger = require("debug");
const debug = logger('harmonyhub:discover:explorer');
const events_1 = require("events");
const ping_1 = require("./ping");
const responseCollector_1 = require("./responseCollector");
function deserializeResponse(response) {
    const pairs = {};
    response.split(';')
        .forEach((rawPair) => {
        const splitted = rawPair.split(':');
        pairs[splitted[0]] = splitted[1];
    });
    return {
        uuid: pairs.uuid,
        ip: pairs.ip,
        friendlyName: pairs.friendlyName,
        fullHubInfo: pairs,
        lastSeen: Date.now()
    };
}
function arrayOfKnownHubs(knownHubs) {
    return Array.from(knownHubs.values());
}
let Explorer = Explorer_1 = class Explorer extends events_1.EventEmitter {
    /**
     * @param incomingPort The port on the current client to use when pinging.
     * If unspecified using any port available.
     * @param pingOptions Defines the broadcasting details for this explorer.
     * @param cleanUpTimeout The interval that the hub does not respond to be
     * considerd offline, but minimal 2 * ping interval + 2500 ms, default 5000 ms
     */
    constructor(incomingPort = 5222, pingOptions, cleanUpTimeout = 5000) {
        super();
        this.knownHubs = new Map();
        this.port = incomingPort;
        if (pingOptions && pingOptions.interval) {
            this.cleanUpTimeout = Math.max(cleanUpTimeout, pingOptions.interval * 2 + 2500);
        }
        else {
            this.cleanUpTimeout = cleanUpTimeout;
        }
        debug(`Explorer(${this.port})`);
        this.ping = new ping_1.Ping(this.port, pingOptions);
    }
    /**
     * Inits the listening for hub replies, and starts broadcasting.
     */
    start() {
        debug('start()');
        this.responseCollector = new responseCollector_1.ResponseCollector(this.port);
        this.responseCollector.on(responseCollector_1.ResponseCollector.Events.RESPONSE, this.handleResponse);
        this.cleanUpIntervalToken = setInterval(this.executeCleanUp, 2000);
        this.responseCollector.start();
        this.ping.start();
    }
    /**
     * Stop the emitting of broadcasts and disassamble all listeners.
     */
    stop() {
        debug('stop()');
        this.ping.stop();
        this.responseCollector.stop();
        clearInterval(this.cleanUpIntervalToken);
    }
    /**
     * Handles the response from a hub by deserializing the response
     * and storing the information. Also emits the online and update events.
     * @param data
     */
    handleResponse(data) {
        const hub = deserializeResponse(data);
        if (this.knownHubs.get(hub.uuid) === undefined) {
            debug(`discovered new hub ${hub.friendlyName}`);
            this.knownHubs.set(hub.uuid, hub);
            this.emit(Explorer_1.Events.ONLINE, hub);
            this.emit(Explorer_1.Events.UPDATE, arrayOfKnownHubs(this.knownHubs));
        }
        else {
            this.knownHubs.get(hub.uuid).lastSeen = Date.now();
        }
    }
    /**
     * Run a cleanup event all 5 seconds to  make sure unavailable hubs
     * are no longer tracked and discharged. Also emits the offline and update events.
     */
    executeCleanUp() {
        debug('executeCleanUp()');
        const now = Date.now();
        Array.from(this.knownHubs.values()).forEach((hub) => {
            const diff = now - hub.lastSeen;
            if (diff > this.cleanUpTimeout) {
                debug(`hub at ${hub.ip} seen last ${diff}ms ago. clean up and tell subscribers that we lost that one.`);
                this.knownHubs.delete(hub.uuid);
                this.emit(Explorer_1.Events.OFFLINE, hub);
                this.emit(Explorer_1.Events.UPDATE, arrayOfKnownHubs(this.knownHubs));
            }
        });
    }
};
Explorer = Explorer_1 = __decorate([
    autobind_decorator_1.default
], Explorer);
exports.Explorer = Explorer;
(function (Explorer) {
    let Events;
    (function (Events) {
        Events["ONLINE"] = "online";
        Events["OFFLINE"] = "offline";
        Events["UPDATE"] = "update";
    })(Events = Explorer.Events || (Explorer.Events = {}));
})(Explorer = exports.Explorer || (exports.Explorer = {}));
exports.Explorer = Explorer;
