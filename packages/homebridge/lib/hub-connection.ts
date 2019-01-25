import { getHarmonyClient, HarmonyClient } from '@harmonyhub/client-ws';
import { Explorer, Explorer as Discover, HubData } from '@harmonyhub/discover';

import autobind from 'autobind-decorator';
import { EventEmitter } from 'events';

export const HubConnectionEvents = {
  CONNECTION_CHANGED: 'connectionChanged',
  STATE_DIGEST: 'stateDigest'
};

export enum HubConnectionStatus {
  UNKNOWN,
  CONNECTING,
  CONNECTED,
  DISCONNECTED
}

@autobind
export class HubConnection extends EventEmitter {

  log: any;
  hubInfo: HubData;
  discover: Explorer;

  client: HarmonyClient;
  clientPromise: Promise<HarmonyClient>;

  status = HubConnectionStatus.UNKNOWN;

  static async createAsync(hubInfo: HubData, log, discover: Explorer): Promise<HubConnection> {
    const conn = new HubConnection(hubInfo, log, discover);
    // tslint:disable-next-line:no-console
    conn.on('error', console.error);
    await conn.connect(hubInfo);
    return conn;
  }

  constructor(hubInfo: HubData, log, discover: Explorer) {
    super();

    this.hubInfo = hubInfo;
    this.log = log;
    this.discover = discover;

    this.discover.on(Explorer.Events.ONLINE, (info: HubData) => {
      if (!info || info.uuid !== this.hubInfo.uuid) {
        return;
      }
      this.handleHubOnline();
    });

    this.discover.on(Explorer.Events.OFFLINE, (info: HubData) => {
      if (!info || info.uuid !== this.hubInfo.uuid) {
        return;
      }
      this.handleHubOffline();
    });
  }

  async connect(hubInfo: HubData): Promise<HarmonyClient> {
    this.hubInfo = hubInfo;

    // if client is available -> disconnect
    if (this.client) {
      await this.disconnect();
    }

    this.emitConnectionChanged(HubConnectionStatus.DISCONNECTED);
    return this.getClient();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.removeAllListeners(HarmonyClient.Events.STATE_DIGEST);
      this.client.removeAllListeners(HarmonyClient.Events.DISCONNECTED);
      this.client.end();
      this.client = null;
      this.emitConnectionChanged(HubConnectionStatus.DISCONNECTED);
    }
    return Promise.resolve();
  }

  /**
   * This function makes sure a harmony client is created, if already there
   * this one is returned otherwise a new connection is made.
   * An error is thrown if the connection could not be established.
   */
  async getClient(): Promise<HarmonyClient> {
    // check if client is connected
    if (this.client) {
      return Promise.resolve(this.client);
    }
    // check if client is connecting
    if (this.clientPromise) {
      return this.clientPromise;
    }

    return this.makeClient();
  }

  async makeClient(): Promise<HarmonyClient> {
    // make a connection (with a timeout of 30 seconds)
    this.emitConnectionChanged(HubConnectionStatus.CONNECTING);
    this.clientPromise = Promise.race([
      getHarmonyClient(this.hubInfo.ip),
      () => new Promise<any>((resolve, reject) => {
        setTimeout(resolve, 30 * 1000);
      })
    ]).then(
      (newClient) => {
        this.clientPromise = null;
        return newClient as HarmonyClient;
      }
    );

    this.client = await this.clientPromise;

    if (this.client === null) {
      this.emitConnectionChanged(HubConnectionStatus.DISCONNECTED);
      return null;
    }

    this.log.debug('created new client for hub with uuid ' + this.hubInfo.uuid);

    this.client.on(
      HarmonyClient.Events.DISCONNECTED,
      this.handleHubOffline
    );

    this.client.on(
      HarmonyClient.Events.STATE_DIGEST,
      (stateDigest) => {
        this.log.debug('got state digest. reemit it');
        this.emit(HubConnectionEvents.STATE_DIGEST, stateDigest);
      }
    );

    // update connection status
    this.emitConnectionChanged(HubConnectionStatus.CONNECTED);

    // set a timeout for this to return
    return this.client;
  }

  async handleHubOnline() {
    this.log.debug(`Hub went online: ${this.hubInfo.uuid}`);
    this.makeClient();
  }

  // here we handle a hub going offline
  async handleHubOffline() {
    this.log.debug(`hub ${this.hubInfo.uuid} went offline.`);
    await this.disconnect();
  }

  // here we handle a client loosing connection and try to reconnect
  async handleHubDisconnected() {
    this.log.debug(`client for hub ${this.hubInfo.uuid} was disconnected. re-establish.`);
    await this.disconnect();
    this.makeClient();
  }

  emitConnectionChanged(status: HubConnectionStatus) {
    if (status) {
      this.status = status;
      this.emit(HubConnectionEvents.CONNECTION_CHANGED, status);
    }
  }
}
