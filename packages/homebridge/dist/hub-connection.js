"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var HubConnection_1;
const events_1 = require("events");
const autobind_decorator_1 = require("autobind-decorator");
const client_1 = require("@harmonyhub/client");
// var Queue = require('queue');
// var Promise = require('bluebird');
// var BluebirdExt = require('./bluebird-ext');
exports.HubConnectionEvents = {
    ConnectionChanged: 'connectionChanged',
    StateDigest: 'stateDigest'
};
var HubConnectionStatus;
(function (HubConnectionStatus) {
    HubConnectionStatus[HubConnectionStatus["Unknown"] = 0] = "Unknown";
    HubConnectionStatus[HubConnectionStatus["Connecting"] = 1] = "Connecting";
    HubConnectionStatus[HubConnectionStatus["Connected"] = 2] = "Connected";
    HubConnectionStatus[HubConnectionStatus["PendingConnection"] = 3] = "PendingConnection";
    HubConnectionStatus[HubConnectionStatus["Disconnected"] = 4] = "Disconnected";
})(HubConnectionStatus = exports.HubConnectionStatus || (exports.HubConnectionStatus = {}));
;
let HubConnection = HubConnection_1 = class HubConnection extends events_1.EventEmitter {
    constructor(hubInfo, log, discover) {
        super();
        //this.hubId = hubInfo.uuid;
        this.hubInfo = hubInfo;
        this.log = log;
        this._discover = discover;
        this._discover.on('online', info => {
            if (!info || info.uuid != this.hubInfo.uuid) {
                return;
            }
            this.handleConnectionOnline();
        });
        this._discover.on('offline', info => {
            if (!info || info.uuid != this.hubInfo.uuid) {
                return;
            }
            this.handleConnectionOffline();
        });
    }
    get status() {
        if (this.client)
            return HubConnectionStatus.Connected;
        if (this._connTask)
            return HubConnectionStatus.Connecting;
        // if (this.queue) return ConnectionStatus.PendingConnection;
        if (this.hubInfo)
            return HubConnectionStatus.Disconnected;
        return HubConnectionStatus.Unknown;
    }
    static createAsync(hubInfo, log, discover) {
        var conn = new HubConnection_1(hubInfo, log, discover);
        conn.on('error', console.error);
        return conn.connectAsync(hubInfo).then(client => conn);
    }
    connectAsync(hubInfo) {
        this.hubInfo = hubInfo;
        // if client is available drop it
        if (this.client) {
            this.client.end();
            this.client = null;
        }
        // this.queue = new Queue();
        // this.queue.concurrency = 1;
        return this.refreshAsync();
    }
    disconnectAsync() {
        var lastClient = this.client;
        // var lastQueue = this.queue;
        // this.queue = null;
        this.client = null;
        this.emitConnectionChanged();
        //TODO: Properly cancel running tasks
        // if (lastQueue) {
        //   lastQueue.end();
        // }
        if (lastClient) {
            lastClient.end();
        }
        return Promise.resolve();
    }
    /**
     * This function makes sure a harmony client is created, if already there
     * this one is returned otherwise a new connection is made.
     * An error is thrown if the connection could not be established.
     */
    getClient() {
        // check if client is already connected
        var client = this.client;
        if (client) {
            return Promise.resolve(client);
        }
        // check if connection is currently established
        var connTask = this._connTask;
        if (connTask) {
            return connTask;
        }
        // start the connection task
        connTask = client_1.getHarmonyClient(this.hubInfo.ip, undefined)
            .then((client) => {
            this.log.debug('created new client for hub with uuid ' + this.hubInfo.uuid);
            client._xmppClient.on('offline', this.handleConnectionOffline);
            client.on('stateDigest', (stateDigest) => {
                this.log.debug('got state digest. reemit it');
                this.emit(exports.HubConnectionEvents.StateDigest, {
                    stateDigest: stateDigest
                });
            });
            // daniels new way to clean old connection
            this.client = client;
            this._connTask = null;
            this.emitConnectionChanged();
            return this.client;
        });
        // save connection attempt and update connection status
        this._connTask = connTask;
        this.emitConnectionChanged();
        // set a timeout for this to return
        return Promise.race([
            connTask,
            () => new Promise((resolve, reject) => {
                setTimeout(resolve, 30 * 1000);
            })
        ])
            .catch((err) => {
            this.log("error during hub connection " + err);
        })
            .then((client) => {
            if (this._connTask == connTask) {
                this._connTask = null;
            }
            this.emitConnectionChanged();
            if (!client) {
                throw new Error("No client currently available");
            }
            return client;
        });
    }
    handleConnectionOnline() {
        this.log.debug("Hub went online: " + this.hubInfo.uuid);
        return this.refresh();
    }
    handleConnectionOffline() {
        this.log.debug('client for hub ' + this.hubInfo.uuid + ' went offline. re-establish.');
        this.client.end();
        this.client = undefined;
        return this.refresh();
    }
    refresh() {
        return this.refreshAsync()
            .catch((err) => {
            this.log.debug(err);
            this.emitConnectionChanged();
        });
    }
    refreshAsync() {
        this.emitConnectionChanged();
        return this.getClient();
        // this.invokeAsync(function(client){
        //   return client;
        // });
    }
    emitConnectionChanged() {
        // no change no event
        if (this._lastStatus == this.status) {
            return;
        }
        this._lastStatus = this.status;
        this.emit(exports.HubConnectionEvents.ConnectionChanged, this.status);
    }
};
HubConnection = HubConnection_1 = __decorate([
    autobind_decorator_1.default
], HubConnection);
exports.HubConnection = HubConnection;
// var startQueueInBackground = function(queue) {
// 	if (queue && !queue.running) {
// 		setTimeout(queue.start.bind(queue), 0);
// 	}
// };
