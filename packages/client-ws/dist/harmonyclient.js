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
var debug = logger("harmonyhub:client-ws:harmonyclient");
// import { default as xmppUtil } from "./util";
const events_1 = require("events");
const websocket_1 = require("websocket");
const WebSocketAsPromised = require("websocket-as-promised");
const got = require("got");
/**
 * Creates a new HarmonyClient using the given xmppClient to communication.
 */
let HarmonyClient = HarmonyClient_1 = class HarmonyClient extends events_1.EventEmitter {
    connect(hubip) {
        debug("connect to harmony hub");
        return this._getRemoteId(hubip)
            .then(response => {
            this._remoteId = response.body.data.remoteId;
        })
            .then(() => this._connect(hubip));
    }
    _getRemoteId(hubip) {
        const payload = {
            url: 'http://' + hubip + ':8088',
            method: 'POST',
            timeout: 5000,
            headers: {
                'Content-type': 'application/json',
                Accept: 'text/plain',
                Origin: 'http//:localhost.nebula.myharmony.com'
            },
            json: true,
            body: {
                id: 0,
                cmd: 'connect.discoveryinfo?get',
                params: {}
            }
        };
        return got(payload);
    }
    _connect(hubip) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'ws://' + hubip + ':8088/?domain=svcs.myharmony.com&hubId=' + this._remoteId;
            debug("connecting to " + url);
            this._wsClient = new WebSocketAsPromised(url, {
                createWebSocket: (url) => new websocket_1.w3cwebsocket(url),
                packMessage: (data) => JSON.stringify(data),
                unpackMessage: (message) => JSON.parse(message),
                attachRequestId: (data, requestId) => {
                    data.hbus.id = requestId;
                    return data;
                },
                extractRequestId: (data) => data && data.id
            });
            this._wsClient.onClose.addListener(() => {
                clearInterval(this._interval);
                this.emit(HarmonyClient_1.Events.DISCONNECTED);
            });
            const payload = {
                hubId: this._remoteId,
                timeout: 30,
                hbus: {
                    cmd: 'vnd.logitech.connect/vnd.logitech.statedigest?get',
                    id: 0,
                    params: {
                        verb: 'get',
                        format: 'json'
                    }
                }
            };
            return this._wsClient.open()
                .then(() => this._interval = setInterval(() => this._wsClient.send(''), 55000))
                .then(() => this._wsClient.onUnpackedMessage.addListener(this._onMessage))
                .then(() => this._wsClient.sendPacked(payload))
                .then(() => this.emit(HarmonyClient_1.Events.CONNECTED));
        });
    }
    _onMessage(message) {
        if (message.type === 'connect.stateDigest?notify') {
            this.onStateDigest(message.data);
        }
    }
    /**
     * The state digest is caused by the hub to let clients know about remote updates
     * @param {message} stateDigest
     */
    onStateDigest(stateDigest) {
        debug("received state digest ", JSON.stringify(stateDigest));
        this.emit(HarmonyClient_1.Events.STATE_DIGEST, stateDigest);
    }
    /**
     * Returns the latest turned on activity from a hub.
     *
     * @returns Promise<string>
     */
    getCurrentActivity() {
        debug("retrieve current activity");
        const payload = {
            hubId: this._remoteId,
            timeout: 30,
            hbus: {
                cmd: 'vnd.logitech.harmony/vnd.logitech.harmony.engine?getCurrentActivity',
                id: 0,
                params: {
                    verb: 'get',
                    format: 'json'
                }
            }
        };
        return this._wsClient.sendRequest(payload)
            .then(response => {
            return response.data.result;
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
        const payload = {
            hubId: this._remoteId,
            timeout: 30,
            hbus: {
                cmd: 'harmony.activityengine?runactivity',
                id: 0,
                params: {
                    async: 'true',
                    timestamp: 0,
                    args: {
                        rule: 'start'
                    },
                    activityId: activityId
                }
            }
        };
        return this._wsClient.sendRequest(payload);
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
        return __awaiter(this, void 0, void 0, function* () {
            debug("check if turned off");
            return this.getCurrentActivity()
                .then(function (activityId) {
                const off = (activityId === "-1");
                debug(off ? "system is currently off" : "system is currently on with activity " + activityId);
                return off;
            });
        });
    }
    /**
     * Acquires all available commands from the hub when resolving the returned promise.
     */
    getAvailableCommands() {
        debug("retrieve available commands");
        const payload = {
            hubId: this._remoteId,
            timeout: 30,
            hbus: {
                cmd: 'vnd.logitech.harmony/vnd.logitech.harmony.engine?config',
                id: 0,
                params: {
                    verb: 'get',
                    format: 'json'
                }
            }
        };
        return this._wsClient.sendRequest(payload)
            .then((resp) => {
            return resp.data;
        });
    }
    /**
     * sends a command to the hub, including the press action and the release after the command_timeframe
     * @param action action name usually 'holdAction'
     * @param body
     * @param command_timeframe the time when to send a release message
     */
    send(action, body, command_timeframe = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let encodedAction;
            if (typeof body === 'string') {
                encodedAction = body;
            }
            else if (body && body.command && body.deviceId) {
                debug(`Sending command ${body.command} to device ${body.deviceId} with delay`);
                encodedAction = `{"command": "${body.command}", "type": "${body.deviceId || 'IRCommand'}", "deviceId": "${body.deviceId}"}`;
            }
            else {
                return Promise.reject("With the send command you need to provide a body parameter which can be a string or {command: string, deviceId: string, type?:string}");
            }
            const payloadPress = {
                hubId: this._remoteId,
                timeout: 30,
                hbus: {
                    cmd: `harmony.engine?${action}`,
                    id: 0,
                    params: {
                        async: 'true',
                        timestamp: 0,
                        status: 'press',
                        verb: 'render',
                        action: encodedAction
                    }
                }
            }, payloadRelease = Object.assign({}, payloadPress, { hbus: Object.assign({}, payloadPress.hbus, { params: Object.assign({}, payloadPress.hbus.params, { status: 'release' }) }) });
            this._wsClient.sendPacked(payloadPress);
            return new Promise((resolve, reject) => {
                if (command_timeframe > 0) {
                    setTimeout(() => {
                        this._wsClient.sendPacked(payloadRelease);
                        resolve();
                    }, command_timeframe);
                }
                else {
                    this._wsClient.sendPacked(payloadRelease);
                    resolve();
                }
            });
        });
    }
    /**
     * sends a command to the hub, including the press action and the release after the command_timeframe
     * @param action action name usually 'holdAction'
     * @param body
     * @param command_timeframe the time when to send a release message
     */
    send(action, body, command_timeframe = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let encodedAction;
            if (typeof body === 'string') {
                encodedAction = body;
            }
            else if (body && body.command && body.deviceId) {
                debug(`Sending command ${body.command} to device ${body.deviceId} with delay`);
                encodedAction = `{"command": "${body.command}", "type": "${body.deviceId || 'IRCommand'}", "deviceId": "${body.deviceId}"}`;
            }
            else {
                return Promise.reject("With the send command you need to provide a body parameter which can be a string or {command: string, deviceId: string, type?:string}");
            }
            const payloadPress = {
                hubId: this._remoteId,
                timeout: 30,
                hbus: {
                    cmd: `harmony.engine?${action}`,
                    id: 0,
                    params: {
                        async: 'true',
                        timestamp: 0,
                        status: 'press',
                        verb: 'render',
                        action: encodedAction
                    }
                }
            }, payloadRelease = Object.assign({}, payloadPress, { hbus: Object.assign({}, payloadPress.hbus, { params: Object.assign({}, payloadPress.hbus.params, { timestamp: command_timeframe, status: 'release' }) }) });
            this._wsClient.sendPacked(payloadPress);
            return new Promise((resolve, reject) => {
                if (command_timeframe > 0) {
                    setTimeout(() => {
                        this._wsClient.sendPacked(payloadRelease);
                        resolve();
                    }, command_timeframe);
                }
                else {
                    this._wsClient.sendPacked(payloadRelease);
                    resolve();
                }
            });
        });
    }
    /**
     * Closes the connection the the hub. You have to create a new client if you would like
     * to communicate again with the hub.
     */
    end() {
        debug("close harmony client");
        this._wsClient.close();
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
    class Function {
    }
    HarmonyClient.Function = Function;
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
