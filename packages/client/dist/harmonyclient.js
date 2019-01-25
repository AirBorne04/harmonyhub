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
var HarmonyClient_1;
const autobind_decorator_1 = require("autobind-decorator");
const logger = require("debug");
const debug = logger('harmonyhub:client:harmonyclient');
const events_1 = require("events");
const util_1 = require("./util");
/**
 * Creates a new HarmonyClient using the given xmppClient to communicate.
 * @param xmppClient
 */
let HarmonyClient = HarmonyClient_1 = class HarmonyClient extends events_1.EventEmitter {
    constructor(xmppClient) {
        super();
        debug('create new harmony client');
        this.xmppClient = xmppClient;
        this.responseHandlerQueue = [];
        this.emit(HarmonyClient_1.Events.CONNECTED);
        xmppClient.on('stanza', this.handleStanza);
        xmppClient.on('close', this.emit(HarmonyClient_1.Events.DISCONNECTED));
        xmppClient.on('error', (error) => {
            debug('XMPP Error: ' + error.message);
        });
    }
    handleStanza(stanza) {
        debug('handleStanza(' + stanza.toString() + ')');
        // Check for state digest:
        const event = stanza.getChild('event');
        if (event && event.attr('type') === 'connect.stateDigest?notify') {
            this.onStateDigest(JSON.parse(event.getText()));
        }
        // Check for queued response handlers:
        this.responseHandlerQueue.forEach((responseHandler, index, array) => {
            if (responseHandler.canHandleStanza(stanza)) {
                debug('received response stanza for queued response handler');
                const response = stanza.getChildText('oa'), oa = stanza.getChild('oa');
                let decodedResponse;
                if (oa && oa.attrs && oa.attrs.errorcode && oa.attrs.errorcode !== 200) {
                    responseHandler.rejectCallback({
                        code: oa.attrs.errorcode,
                        message: oa.attrs.errorstring
                    });
                }
                else {
                    if (responseHandler.responseType === 'json') {
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
        debug('received state digest');
        this.emit(HarmonyClient_1.Events.STATE_DIGEST, stateDigest);
    }
    /**
     * Returns the latest turned on activity from a hub.
     *
     * @returns Promise<string>
     */
    getCurrentActivity() {
        return __awaiter(this, void 0, void 0, function* () {
            debug('retrieve current activity');
            return this.request('getCurrentActivity')
                .then((response) => {
                return response.result;
            });
        });
    }
    /**
     * Retrieves a list with all available activities.
     */
    getActivities() {
        return __awaiter(this, void 0, void 0, function* () {
            debug('retrieve activities');
            return this.getAvailableCommands()
                .then((availableCommands) => {
                return availableCommands.activity;
            });
        });
    }
    /**
     * Starts an activity with the given id.
     */
    startActivity(activityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const timestamp = new Date().getTime(), body = `activityId=${activityId}:timestamp=${timestamp}`;
            return this.request('startactivity', body, 'encoded', (stanza) => {
                // This canHandleStanzaFn waits for a stanza that confirms starting the activity.
                const event = stanza.getChild('event');
                let canHandleStanza = false;
                if (event && event.attr('type') === 'connect.stateDigest?notify') {
                    const digest = JSON.parse(event.getText());
                    if (activityId === '-1' && digest.activityId === activityId && digest.activityStatus === 0) {
                        canHandleStanza = true;
                    }
                    else if (activityId !== '-1' && digest.activityId === activityId && digest.activityStatus === 2) {
                        canHandleStanza = true;
                    }
                }
                return canHandleStanza;
            });
        });
    }
    /**
     * Turns the currently running activity off. This is implemented by "starting" an imaginary activity with the id -1.
     */
    turnOff() {
        return __awaiter(this, void 0, void 0, function* () {
            debug('turn off');
            return this.startActivity('-1');
        });
    }
    /**
     * Checks if the hub has now activity turned on. This is implemented by checking the hubs current activity. If the
     * activities id is equal to -1, no activity is on currently.
     */
    isOff() {
        return __awaiter(this, void 0, void 0, function* () {
            debug('check if turned off');
            return this.getCurrentActivity()
                .then((activityId) => {
                const off = (activityId === '-1');
                debug(off ? 'system is currently off' : 'system is currently on with activity ' + activityId);
                return off;
            });
        });
    }
    /**
     * Acquires all available commands from the hub when resolving the returned promise.
     */
    getAvailableCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            debug('retrieve available commands');
            return this.request('config', undefined, 'json')
                .then((response) => {
                return response;
            });
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
        debug(`buildCommandIqStanza for command '${command}' with body ${body}`);
        return util_1.default.buildIqStanza('get', 'connect.logitech.com', 'vnd.logitech.harmony/vnd.logitech.harmony.engine?' + command, body);
    }
    defaultCanHandleStanzaPredicate(awaitedId, stanza) {
        const stanzaId = stanza.attr('id');
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
        debug(`request with command '${command}' with body ${body}`);
        return new Promise((resolveCallback, rejectCallback) => {
            const iq = this.buildCommandIqStanza(command, body), id = iq.attr('id');
            expectedResponseType = expectedResponseType || 'encoded';
            canHandleStanzaPredicate =
                canHandleStanzaPredicate || ((stanza) => this.defaultCanHandleStanzaPredicate(id, stanza));
            this.responseHandlerQueue.push({
                canHandleStanza: canHandleStanzaPredicate,
                resolveCallback,
                rejectCallback,
                responseType: expectedResponseType
            });
            // setImmediate
            this.xmppClient.send(iq);
        });
    }
    /**
     * Sends a command with given body to the hub. The returned promise gets resolved
     * with a generic hub response without any content or error (eg. device not existing).
     */
    send(action, body) {
        return __awaiter(this, void 0, void 0, function* () {
            debug(`send command '${action}' with body ${body}`);
            const simpleAcknowledge = (stanza) => {
                return stanza.getChild('oa') === undefined;
            };
            if (typeof body === 'string') {
                return this.request(action, body, undefined, simpleAcknowledge);
            }
            else if (body && body.command && body.deviceId) {
                return this.request(action, `{"command"::"${body.command}","type"::"${body.type || 'IRCommand'}","deviceId"::"${body.deviceId}"}`, undefined, simpleAcknowledge);
            }
            else {
                return Promise.reject('With the send command you need to provide a body parameter which can be ' +
                    'a string or {command: string, deviceId: string, type?:string}');
            }
        });
    }
    /**
     * Closes the connection the the hub. You have to create a new client if you would like
     * to communicate again with the hub.
     */
    end() {
        debug('close harmony client');
        this.xmppClient.end();
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
        Events["CONNECTED"] = "open";
        Events["DISCONNECTED"] = "close";
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
    class PowerFeatures {
    }
    HarmonyClient.PowerFeatures = PowerFeatures;
    class PowerAction {
    }
    HarmonyClient.PowerAction = PowerAction;
    class ControlGroup {
    }
    HarmonyClient.ControlGroup = ControlGroup;
    class FunctionObj {
    }
    HarmonyClient.FunctionObj = FunctionObj;
    class StateDigest {
    }
    HarmonyClient.StateDigest = StateDigest;
    let StateDigestStatus;
    (function (StateDigestStatus) {
        StateDigestStatus[StateDigestStatus["HUB_IS_OFF"] = 0] = "HUB_IS_OFF";
        StateDigestStatus[StateDigestStatus["ACTIVITY_STARTING"] = 1] = "ACTIVITY_STARTING";
        StateDigestStatus[StateDigestStatus["ACTIVITY_STARTED"] = 2] = "ACTIVITY_STARTED";
        StateDigestStatus[StateDigestStatus["HUB_TURNING_OFF"] = 3] = "HUB_TURNING_OFF";
    })(StateDigestStatus = HarmonyClient.StateDigestStatus || (HarmonyClient.StateDigestStatus = {}));
    let ERROR_CODE;
    (function (ERROR_CODE) {
        ERROR_CODE["OK"] = "200";
    })(ERROR_CODE = HarmonyClient.ERROR_CODE || (HarmonyClient.ERROR_CODE = {}));
})(HarmonyClient = exports.HarmonyClient || (exports.HarmonyClient = {}));
exports.HarmonyClient = HarmonyClient;
exports.default = HarmonyClient;
