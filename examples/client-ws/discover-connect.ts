import { getHarmonyClient, HarmonyClient } from '@harmonyhub/client-ws';
import { Explorer, HubData } from '@harmonyhub/discover';

async function run(): Promise<void> {
  const explorer = new Explorer();

  explorer.on(Explorer.Events.ONLINE, (data: HubData) => {
    console.log('reachable ', data.fullHubInfo);

    connectToHub(data);
  });

  explorer.on(Explorer.Events.UPDATE, (data: Array<HubData>) => {
    console.log('update ', data);
  });

  explorer.on(Explorer.Events.OFFLINE, (data: HubData) => {
    console.log('not reachable ', data);
  });

  explorer.start();
}

const hubConnections = new Map<string, HarmonyClient>();
async function connectToHub(data: HubData) {
  if (hubConnections.get(data.uuid) === undefined) {
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
        hubConnections.set(data.uuid, undefined);
        console.log(`client got disconnected, now #${hubConnections.size} active clients`);
      }
    );

    hubConnections.set(data.uuid, hubclient);
  }
  else {
    console.log('already connected to this hub');
  }

  console.log(`connected to #${hubConnections.size} clients`);
}

run().then().catch();
