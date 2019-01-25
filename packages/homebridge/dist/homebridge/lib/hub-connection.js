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
var HubConnection_1;
const client_ws_1 = require("@harmonyhub/client-ws");
const discover_1 = require("@harmonyhub/discover");
const autobind_decorator_1 = require("autobind-decorator");
const events_1 = require("events");
exports.HubConnectionEvents = {
    CONNECTION_CHANGED: 'connectionChanged',
    STATE_DIGEST: 'stateDigest'
};
var HubConnectionStatus;
(function (HubConnectionStatus) {
    HubConnectionStatus[HubConnectionStatus["UNKNOWN"] = 0] = "UNKNOWN";
    HubConnectionStatus[HubConnectionStatus["CONNECTING"] = 1] = "CONNECTING";
    HubConnectionStatus[HubConnectionStatus["CONNECTED"] = 2] = "CONNECTED";
    HubConnectionStatus[HubConnectionStatus["DISCONNECTED"] = 3] = "DISCONNECTED";
})(HubConnectionStatus = exports.HubConnectionStatus || (exports.HubConnectionStatus = {}));
let HubConnection = HubConnection_1 = class HubConnection extends events_1.EventEmitter {
    constructor(hubInfo, log, discover) {
        super();
        this.status = HubConnectionStatus.UNKNOWN;
        this.hubInfo = hubInfo;
        this.log = log;
        this.discover = discover;
        this.discover.on(discover_1.Explorer.Events.ONLINE, (info) => {
            if (!info || info.uuid !== this.hubInfo.uuid) {
                return;
            }
            this.handleHubOnline();
        });
        this.discover.on(discover_1.Explorer.Events.OFFLINE, (info) => {
            if (!info || info.uuid !== this.hubInfo.uuid) {
                return;
            }
            this.handleHubOffline();
        });
    }
    static createAsync(hubInfo, log, discover) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = new HubConnection_1(hubInfo, log, discover);
            // tslint:disable-next-line:no-console
            conn.on('error', console.error);
            yield conn.connect(hubInfo);
            return conn;
        });
    }
    connect(hubInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            this.hubInfo = hubInfo;
            // if client is available -> disconnect
            if (this.client) {
                yield this.disconnect();
            }
            this.emitConnectionChanged(HubConnectionStatus.DISCONNECTED);
            return this.getClient();
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                this.client.removeAllListeners(client_ws_1.HarmonyClient.Events.STATE_DIGEST);
                this.client.removeAllListeners(client_ws_1.HarmonyClient.Events.DISCONNECTED);
                this.client.end();
                this.client = null;
                this.emitConnectionChanged(HubConnectionStatus.DISCONNECTED);
            }
            return Promise.resolve();
        });
    }
    /**
     * This function makes sure a harmony client is created, if already there
     * this one is returned otherwise a new connection is made.
     * An error is thrown if the connection could not be established.
     */
    getClient() {
        return __awaiter(this, void 0, void 0, function* () {
            // check if client is connected
            if (this.client) {
                return Promise.resolve(this.client);
            }
            // check if client is connecting
            if (this.clientPromise) {
                return this.clientPromise;
            }
            return this.makeClient();
        });
    }
    makeClient() {
        return __awaiter(this, void 0, void 0, function* () {
            // make a connection (with a timeout of 30 seconds)
            this.emitConnectionChanged(HubConnectionStatus.CONNECTING);
            this.clientPromise = Promise.race([
                client_ws_1.getHarmonyClient(this.hubInfo.ip),
                () => new Promise((resolve, reject) => {
                    setTimeout(resolve, 30 * 1000);
                })
            ]).then((newClient) => {
                this.clientPromise = null;
                return newClient;
            });
            this.client = yield this.clientPromise;
            if (this.client === null) {
                this.emitConnectionChanged(HubConnectionStatus.DISCONNECTED);
                return null;
            }
            this.log.debug('created new client for hub with uuid ' + this.hubInfo.uuid);
            this.client.on(client_ws_1.HarmonyClient.Events.DISCONNECTED, this.handleHubOffline);
            this.client.on(client_ws_1.HarmonyClient.Events.STATE_DIGEST, (stateDigest) => {
                this.log.debug('got state digest. reemit it');
                this.emit(exports.HubConnectionEvents.STATE_DIGEST, stateDigest);
            });
            // update connection status
            this.emitConnectionChanged(HubConnectionStatus.CONNECTED);
            // set a timeout for this to return
            return this.client;
        });
    }
    handleHubOnline() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.debug(`Hub went online: ${this.hubInfo.uuid}`);
            this.makeClient();
        });
    }
    // here we handle a hub going offline
    handleHubOffline() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.debug(`hub ${this.hubInfo.uuid} went offline.`);
            yield this.disconnect();
        });
    }
    // here we handle a client loosing connection and try to reconnect
    handleHubDisconnected() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.debug(`client for hub ${this.hubInfo.uuid} was disconnected. re-establish.`);
            yield this.disconnect();
            this.makeClient();
        });
    }
    emitConnectionChanged(status) {
        if (status) {
            this.status = status;
            this.emit(exports.HubConnectionEvents.CONNECTION_CHANGED, status);
        }
    }
};
HubConnection = HubConnection_1 = __decorate([
    autobind_decorator_1.default
], HubConnection);
exports.HubConnection = HubConnection;
