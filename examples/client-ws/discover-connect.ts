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
// const hubConnections = new Array<HarmonyClient>();
async function connectToHub(data: HubData) {
  if (hubConnections.get(data.uuid) === undefined) {
    const hubclient = await getHarmonyClient(data.ip, { remoteId: data.fullHubInfo.remoteId });

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
