"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    return Array.from(knownHubs.keys()).map(function (hubUuid) {
        return knownHubs.get(hubUuid);
    });
}
class Explorer extends events_1.EventEmitter {
    constructor(port, pingOptions) {
        super();
        this.knownHubs = new Map();
        this.port = port || 5222;
        debug("Explorer(" + this.port + ")");
        this.ping = new ping_1.Ping(this.port, pingOptions);
        [
            this.start, this.stop, this.handleResponse,
            this.executeCleanUp
        ].forEach((func) => {
            this[func.name] = func.bind(this);
        });
    }
    start() {
        debug("start()");
        this.responseCollector = new responseCollector_1.ResponseCollector(this.port);
        this.responseCollector.on("response", this.handleResponse);
        this.cleanUpIntervalToken = setInterval(this.executeCleanUp, 5000);
        this.responseCollector.start();
        this.ping.start();
    }
    stop() {
        debug("stop()");
        this.ping.stop();
        this.responseCollector.stop();
        clearInterval(this.cleanUpIntervalToken);
    }
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
    executeCleanUp() {
        debug("executeCleanUp()");
        var now = Date.now();
        Array.from(this.knownHubs.keys()).forEach((hubUuid) => {
            var hub = this.knownHubs.get(hubUuid);
            var diff = now - hub.lastSeen;
            if (diff > 5000) {
                debug("hub at " + hub.ip + " seen last " + diff + "ms ago. clean up and tell subscribers that we lost that one.");
                this.knownHubs.delete(hubUuid);
                this.emit("offline", hub);
                this.emit("update", arrayOfKnownHubs(this.knownHubs));
            }
        });
    }
}
exports.Explorer = Explorer;
