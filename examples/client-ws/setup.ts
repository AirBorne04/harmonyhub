import { getHarmonyClient, HarmonyClient } from '@harmonyhub/client-ws';
import { Explorer, HubData } from '@harmonyhub/discover';
import { EventEmitter } from 'events';

export class HubReporter extends EventEmitter {

  explorer = new Explorer();
  hubConnections = new Map<string, HarmonyClient>();

  start() {
    this.explorer.on(Explorer.Events.ONLINE, (data: HubData) => {
      console.log('reachable ', data.fullHubInfo);

      this.connectToHub(data);
    });

    this.explorer.on(Explorer.Events.UPDATE, (data: Array<HubData>) => {
      console.log('updated ', data);
    });

    this.explorer.on(Explorer.Events.OFFLINE, (data: HubData) => {
      console.log('not reachable ', data);
    });

    this.explorer.start();
  }

  stop() {
    this.explorer.stop();
  }

  async connectToHub(data: HubData) {
    if (this.hubConnections.get(data.uuid) === undefined) {
      // with the websocket client the port is irrelevant
      // and can be discarded, but for 100% api compatibility
      // with the @harmonyhub/client xmpp version of this
      // library it doesn't hurt to keep it
      // passing in the remoteId saves one data request to the
      // hub which the library performs automatically when the
      // remoteId is not provided
      const hubclient = await getHarmonyClient(data.ip, {
        port: parseInt(data.fullHubInfo.port, 10),
        remoteId: data.fullHubInfo.remoteId
      });

      hubclient.on(HarmonyClient.Events.DISCONNECTED,
        () => {
          this.hubConnections.set(data.uuid, undefined);
          console.log(`client got disconnected, now #${this.hubConnections.size} active clients`);
        }
      );

      hubclient.on( HarmonyClient.Events.DISCONNECTED, () => this.emit( HarmonyClient.Events.DISCONNECTED));
      hubclient.on( HarmonyClient.Events.CONNECTED,    () => this.emit( HarmonyClient.Events.CONNECTED, hubclient ));
      hubclient.on( HarmonyClient.Events.STATE_DIGEST,
        (digest: HarmonyClient.StateDigest) => this.emit( HarmonyClient.Events.STATE_DIGEST, { hubclient, digest } )
      );

      this.hubConnections.set(data.uuid, hubclient);
    }
    else {
      console.log('already connected to this hub');
    }

    console.log(`connected to #${this.hubConnections.size} clients`);
  }
}
