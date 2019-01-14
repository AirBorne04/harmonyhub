import { getHarmonyClient, HarmonyClient } from '../../packages/client-ws';

const hubIp = '192.168.0.30';
async function run() {
  const harmonyClient = await getHarmonyClient(hubIp);

  try {
    // register state digest
    harmonyClient.on(HarmonyClient.Events.STATE_DIGEST,
      (digest: HarmonyClient.StateDigest) => {
        console.log(digest);
        console.log(
          `activity -> ${digest.activityId} is -> ${digest.activityStatus}`
        )
      }
    );
  } catch(error) {
    console.error(`Error ${error.message}`);
  }

  console.log(
    `listening for state digest from harmony hub on ${hubIp}.`
  );
}

run().catch(
  err => console.log(err)
);