"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var HarmonyClient_1;
const autobind_decorator_1 = require("autobind-decorator");
const logger = require("debug");
var debug = logger("harmonyhub:client:harmonyclient");
const util_1 = require("./util");
const events_1 = require("events");
/**
 * Creates a new HarmonyClient using the given xmppClient to communication.
 * @param xmppClient
 */
let HarmonyClient = HarmonyClient_1 = class HarmonyClient extends events_1.EventEmitter {
    constructor(xmppClient) {
        super();
        debug("create new harmony client");
        this._xmppClient = xmppClient;
        this._responseHandlerQueue = [];
        xmppClient.on("stanza", this.handleStanza);
        xmppClient.on("error", function (error) {
            debug("XMPP Error: " + error.message);
        });
    }
    handleStanza(stanza) {
        debug("handleStanza(" + stanza.toString() + ")");
        // Check for state digest:
        var event = stanza.getChild("event");
        if (event && event.attr("type") === "connect.stateDigest?notify") {
            this.onStateDigest(JSON.parse(event.getText()));
        }
        // Check for queued response handlers:
        this._responseHandlerQueue.forEach(function (responseHandler, index, array) {
            if (responseHandler.canHandleStanza(stanza)) {
                debug("received response stanza for queued response handler");
                var response = stanza.getChildText("oa"), oa = stanza.getChild("oa"), decodedResponse;
                if (oa && oa.attrs && oa.attrs.errorcode && oa.attrs.errorcode != 200) {
                    responseHandler.rejectCallback({
                        code: oa.attrs.errorcode,
                        message: oa.attrs.errorstring
                    });
                }
                else {
                    if (responseHandler.responseType === "json") {
                        decodedResponse = JSON.parse(response);
                    }
                    else {
                        decodedResponse = util_1.default.decodeColonSeparatedResponse(response);
                    }
                    responseHandler.resolveCallback(decodedResponse);
                }
                array.splice(index, 1);
            }
        });
    }
    /**
     * The state digest is caused by the hub to let clients know about remote updates
     * @param {message} stateDigest
     */
    onStateDigest(stateDigest) {
        debug("received state digest");
        this.emit(HarmonyClient_1.Events.STATE_DIGEST, stateDigest);
    }
    /**
     * Returns the latest turned on activity from a hub.
     *
     * @returns Promise<string>
     */
    getCurrentActivity() {
        debug("retrieve current activity");
        return this.request("getCurrentActivity")
            .then(function (response) {
            return response.result;
        });
    }
    /**
     * Retrieves a list with all available activities.
     */
    getActivities() {
        debug("retrieve activities");
        return this.getAvailableCommands()
            .then(function (availableCommands) {
            return availableCommands.activity;
        });
    }
    /**
     * Starts an activity with the given id.
     */
    startActivity(activityId) {
        var timestamp = new Date().getTime();
        var body = "activityId=" + activityId + ":timestamp=" + timestamp;
        return this.request("startactivity", body, "encoded", (stanza) => {
            // This canHandleStanzaFn waits for a stanza that confirms starting the activity.
            var event = stanza.getChild("event"), canHandleStanza = false;
            if (event && event.attr("type") === "connect.stateDigest?notify") {
                var digest = JSON.parse(event.getText());
                if (activityId === "-1" && digest.activityId === activityId && digest.activityStatus === 0) {
                    canHandleStanza = true;
                }
                else if (activityId !== "-1" && digest.activityId === activityId && digest.activityStatus === 2) {
                    canHandleStanza = true;
                }
            }
            return canHandleStanza;
        });
    }
    /**
     * Turns the currently running activity off. This is implemented by "starting" an imaginary activity with the id -1.
     */
    turnOff() {
        debug("turn off");
        return this.startActivity("-1");
    }
    /**
     * Checks if the hub has now activity turned on. This is implemented by checking the hubs current activity. If the
     * activities id is equal to -1, no activity is on currently.
     */
    isOff() {
        debug("check if turned off");
        return this.getCurrentActivity()
            .then(function (activityId) {
            var off = (activityId === "-1");
            debug(off ? "system is currently off" : "system is currently on with activity " + activityId);
            return off;
        });
    }
    /**
     * Acquires all available commands from the hub when resolving the returned promise.
     */
    getAvailableCommands() {
        debug("retrieve available commands");
        return this.request("config", undefined, "json")
            .then((response) => {
            return response;
        });
    }
    /**
     * Builds an IQ stanza containing a specific command with given body, ready to send to the hub.
     *
     * @param command
     * @param body
     * @returns {Stanza}
     */
    buildCommandIqStanza(command, body) {
        debug("buildCommandIqStanza for command '" + command + "' with body " + body);
        return util_1.default.buildIqStanza("get", "connect.logitech.com", "vnd.logitech.harmony/vnd.logitech.harmony.engine?" + command, body);
    }
    defaultCanHandleStanzaPredicate(awaitedId, stanza) {
        var stanzaId = stanza.attr("id");
        return (stanzaId && stanzaId.toString() === awaitedId.toString());
    }
    /**
     * Sends a command with the given body to the hub. The returned promise gets resolved as soon as a response for this
     * very request arrives.
     *
     * By specifying expectedResponseType with either "json" or "encoded", you advice the response stanza handler how you
     * expect the responses data encoding. See the protocol guide for further information.
     *
     * The canHandleStanzaFn parameter allows to define a predicate to determine if an incoming stanza is the response to
     * your request. This can be handy if a generic stateDigest message might be the acknowledgment to your initial
     * request.
     * *
     * @param command
     * @param body
     * @param expectedResponseType
     * @param canHandleStanzaPredicate
     */
    request(command, body, expectedResponseType, canHandleStanzaPredicate) {
        debug("request with command '" + command + "' with body " + body);
        var resolveCallback, rejectCallback, prom = new Promise((resolve, reject) => {
            const iq = this.buildCommandIqStanza(command, body), id = iq.attr("id");
            expectedResponseType = expectedResponseType || "encoded";
            canHandleStanzaPredicate = canHandleStanzaPredicate || (stanza => this.defaultCanHandleStanzaPredicate(id, stanza));
            resolveCallback = resolve;
            rejectCallback = reject;
            // setImmediate
            this._xmppClient.send(iq);
        });
        this._responseHandlerQueue.push({
            canHandleStanza: canHandleStanzaPredicate,
            resolveCallback,
            rejectCallback,
            responseType: expectedResponseType
        });
        return prom;
    }
    /**
     * Sends a command with given body to the hub. The returned promise gets resolved
     * with a generic hub response without any content or error (eg. device not existing).
     */
    send(action, body) {
        debug("send command '" + action + "' with body " + body);
        var simpleAcknowledge = stanza => {
            return stanza.getChild("oa") === undefined;
        };
        if (typeof body == "string") {
            return this.request(action, body, undefined, simpleAcknowledge);
        }
        else if (body && body.command && body.deviceId) {
            return this.request(action, `{"command"::"${body.command}","type"::"${body.type || 'IRCommand'}","deviceId"::"${body.deviceId}"}`, undefined, simpleAcknowledge);
        }
        else {
            return Promise.reject("With the send command you need to provide a body parameter which can be a string or {command: string, deviceId: string, type?:string}");
        }
    }
    /**
     * Closes the connection the the hub. You have to create a new client if you would like
     * to communicate again with the hub.
     */
    end() {
        debug("close harmony client");
        this._xmppClient.end();
    }
};
HarmonyClient = HarmonyClient_1 = __decorate([
    autobind_decorator_1.default
], HarmonyClient);
exports.HarmonyClient = HarmonyClient;
(function (HarmonyClient) {
    let Events;
    (function (Events) {
        Events["STATE_DIGEST"] = "stateDigest";
    })(Events = HarmonyClient.Events || (HarmonyClient.Events = {}));
    class ConfigDescription {
    }
    HarmonyClient.ConfigDescription = ConfigDescription;
    class ActivityDescription {
    }
    HarmonyClient.ActivityDescription = ActivityDescription;
    class DeviceDescription {
    }
    HarmonyClient.DeviceDescription = DeviceDescription;
})(HarmonyClient = exports.HarmonyClient || (exports.HarmonyClient = {}));
exports.HarmonyClient = HarmonyClient;
exports.default = HarmonyClient;
