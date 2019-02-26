import { HarmonyClient } from '@harmonyhub/client-ws';
import { HubReporter } from './setup';

const hubReporter = new HubReporter();

hubReporter.on(
  HarmonyClient.Events.STATE_DIGEST, (evt: { hubclient: HarmonyClient, digest: HarmonyClient.StateDigest }) => {
    console.log(evt.digest);
    console.log(
      `activity -> ${evt.digest.activityId} is -> ${evt.digest.activityStatus}`
    );
  }
);

hubReporter.start();
console.log('listening for 30 seconds to retrieve hub infos from the network');
setTimeout( () => hubReporter.stop(), 30 * 1000 );
