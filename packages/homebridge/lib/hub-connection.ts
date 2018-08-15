import { Explorer } from "@harmonyhub/discover";
import { EventEmitter } from "events";
import autobind from "autobind-decorator";

import { getHarmonyClient as Client } from "@harmonyhub/client";
import { HarmonyClient } from "@harmonyhub/client/dist/harmonyclient";

// var Queue = require('queue');
// var Promise = require('bluebird');
// var BluebirdExt = require('./bluebird-ext');

export const HubConnectionEvents = {
	ConnectionChanged: 'connectionChanged',
	StateDigest: 'stateDigest'
};

export enum HubConnectionStatus {
	Unknown,
	Connecting,
	Connected,
	PendingConnection,
	Disconnected
};

@autobind
export class HubConnection extends EventEmitter {

  get status():HubConnectionStatus {
    if (this.client) return HubConnectionStatus.Connected;
    if (this._connTask) return HubConnectionStatus.Connecting;
    // if (this.queue) return ConnectionStatus.PendingConnection;
    if (this.hubInfo) return HubConnectionStatus.Disconnected;
    return HubConnectionStatus.Unknown;
  }

  log: any;
  // hubId: string;
  hubInfo: {uuid, ip};
  _discover: Explorer;

  client: HarmonyClient;
  // queue;
  _connTask: Promise<HarmonyClient>;
  _lastStatus: HubConnectionStatus;

  static createAsync(hubInfo: {uuid, ip}, log, discover: Explorer): Promise<HubConnection> {
    var conn = new HubConnection(hubInfo, log, discover);
    conn.on('error', console.error);
  
    return conn.connectAsync(hubInfo).then(
      client => conn
    );
  }

  constructor(hubInfo: {uuid, ip}, log, discover: Explorer) {
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

  connectAsync(hubInfo): Promise<HarmonyClient> {
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
  getClient(): Promise<HarmonyClient> {
    // check if client is already connected
    var client = this.client;
    if (client) {
      return Promise.resolve(client);
    }
    // check if connection is currently established
    var connTask:Promise<HarmonyClient> = this._connTask;
    if (connTask) {
      return connTask;
    }
    // start the connection task
    connTask = Client(this.hubInfo.ip, undefined)
      .then((client:HarmonyClient) => {
        this.log.debug('created new client for hub with uuid ' + this.hubInfo.uuid);
  
        client._xmppClient.on('offline', this.handleConnectionOffline);
  
        client.on('stateDigest', (stateDigest) => {
          this.log.debug('got state digest. reemit it');
          this.emit(HubConnectionEvents.StateDigest, {
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
          }
        )
      ])
      .catch((err) => {
        this.log("error during hub connection " + err)
      })
      .then((client) => {
        if (this._connTask == connTask) {
          this._connTask = null;
        }
        this.emitConnectionChanged();

        if (!client) {
          throw new Error("No client currently available");
        }

        return client as HarmonyClient;
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

  refresh(): Promise<void | HarmonyClient> {
    return this.refreshAsync()
      .catch((err) => {
        this.log.debug(err);
        this.emitConnectionChanged();
      });
  }

  refreshAsync(): Promise<HarmonyClient> {
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
    this.emit(HubConnectionEvents.ConnectionChanged, this.status);
  }

  // invokeAsync(func) {
  //   var self = this;
  //   return new Promise(function(resolve, reject) {
  //     self.queue.push(resolve);
  //     startQueueInBackground(self.queue);
  //   })
  //   .then(function(cb){
  //     return self._getClientAsync()
  //       .then(BluebirdExt.asBlueBird(func))
  //       .finally(function(){
  //         setTimeout(cb, 0);
  //       })
  //       .catch(function(err){
  //         throw err;
  //       });
  //   });
  // }
}

// var startQueueInBackground = function(queue) {
// 	if (queue && !queue.running) {
// 		setTimeout(queue.start.bind(queue), 0);
// 	}
// };