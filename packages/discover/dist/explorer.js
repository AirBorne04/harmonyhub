"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const autobind_decorator_1 = require("autobind-decorator");
const logger = require("debug");
var debug = logger("harmonyhub:discover:explorer");
const events_1 = require("events");
const ping_1 = require("./ping");
const responseCollector_1 = require("./responseCollector");
function deserializeResponse(response) {
    var pairs = {};
    response.split(";")
        .forEach((rawPair) => {
        var splitted = rawPair.split(":");
        pairs[splitted[0]] = splitted[1];
    });
    return pairs;
}
function arrayOfKnownHubs(knownHubs) {
    return Array.from(knownHubs.values());
}
let Explorer = class Explorer extends events_1.EventEmitter {
    /**
     * @param incomingPort The port on the current client to use when pinging.
     * @param pingOptions Defines the broadcasting details for this explorer.
     */
    constructor(incomingPort, pingOptions) {
        super();
        this.knownHubs = new Map();
        this.port = incomingPort;
        debug("Explorer(" + this.port + ")");
        this.ping = new ping_1.Ping(this.port, pingOptions);
    }
    /**
     * Inits the listening for hub replies, and starts broadcasting.
     */
    start() {
        debug("start()");
        this.responseCollector = new responseCollector_1.ResponseCollector(this.port);
        this.responseCollector.on("response", this.handleResponse);
        this.cleanUpIntervalToken = setInterval(this.executeCleanUp, 5000);
        this.responseCollector.start();
        this.ping.start();
    }
    /**
     * Stop the emitting of broadcasts and disassamble all listeners.
     */
    stop() {
        debug("stop()");
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
        var hub = deserializeResponse(data);
        if (this.knownHubs.get(hub.uuid) === undefined) {
            debug("discovered new hub " + hub.friendlyName);
            this.knownHubs.set(hub.uuid, hub);
            this.emit("online", hub);
            this.emit("update", arrayOfKnownHubs(this.knownHubs));
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
        debug("executeCleanUp()");
        var now = Date.now();
        Array.from(this.knownHubs.values()).forEach((hub) => {
            // var hub = this.knownHubs.get(hubUuid);
            var diff = now - hub.lastSeen;
            if (diff > 5000) {
                debug("hub at " + hub.ip + " seen last " + diff + "ms ago. clean up and tell subscribers that we lost that one.");
                this.knownHubs.delete(hub.uuid);
                this.emit("offline", hub);
                this.emit("update", arrayOfKnownHubs(this.knownHubs));
            }
        });
    }
};
Explorer = __decorate([
    autobind_decorator_1.default
], Explorer);
exports.Explorer = Explorer;
