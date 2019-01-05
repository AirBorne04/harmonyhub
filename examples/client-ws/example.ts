import { getHarmonyClient } from "../../packages/client-ws/dist";

async function run(): Promise<void> {
  const harmonyClient = await getHarmonyClient("192.168.0.30");

  // const encodedAction = `{"command"::"VolumeUp","type"::"IRCommand","deviceId"::"27633596"}`;
  // const dt_press = `action=${encodedAction}:status=press`;
  // const dt_release = `action=${encodedAction}:status=release`;

  try {
    const commands = await harmonyClient.getAvailableCommands();
    console.log('current activity', 
      await harmonyClient.isOff()
    );

    harmonyClient.turnOff();
    
  //   await harmonyClient.send('holdAction', dt_press);
  //   await harmonyClient.send('holdAction', dt_release);
    
    harmonyClient.end();
  } catch(error) {
    console.error('Error', error.message);
  }
}

run().catch(
  err => console.log(err)
);