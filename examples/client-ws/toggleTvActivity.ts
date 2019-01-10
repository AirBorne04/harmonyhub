import { getHarmonyClient } from '../../packages/client-ws';

async function run() {
  const harmony = await getHarmonyClient('192.168.0.30'),
        isOff = await harmony.isOff();
  console.log('connected and '+ isOff);
  if (isOff) {
    console.log('Currently off. Turning TV on.');

    const activities = await harmony.getActivities(),
      activity = activities[0];
    
    if (activity) {
      await harmony.startActivity(activity.id);
    }
  }
  else {
    console.log('Currently on. Turning TV off');
    
    await harmony.turnOff();
  }

  harmony.end();
}

run().catch(
  err => console.log(err)
);