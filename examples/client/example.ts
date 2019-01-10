import { getHarmonyClient } from "../../packages/client/dist";

async function run(): Promise<void> {
  const harmonyClient = await getHarmonyClient("192.168.0.31");

  const encodedAction = `{"command"::"VolumeUp","type"::"IRCommand","deviceId"::"27633596"}`;
  const dt_press = `action=${encodedAction}:status=press`;
  const dt_release = `action=${encodedAction}:status=release`;

  try {
    const commands = await harmonyClient.getAvailableCommands();
    console.log('commands', commands);
    await harmonyClient.send('holdAction', dt_press);
    await harmonyClient.send('holdAction', dt_release);
    
    harmonyClient.end();
  } catch(error) {
    console.error('Error', error.message);
  }
}

async function run1(): Promise<void> {
  const harmonyClient = await getHarmonyClient("192.168.0.30");

  const commands = await harmonyClient.getAvailableCommands();

  const tvs = commands.device.filter(
    device => device.type == "Tv"
  );

  console.log(tvs);
  return Promise.resolve();

  const encodedAction = `{"command"::"VolumeUp","type"::"IRCommand","deviceId"::"27633596"}`;
  const dt_press = `action=${encodedAction}:status=press`;
  const dt_release = `action=${encodedAction}:status=release`;

  try {
    const commands = await harmonyClient.getAvailableCommands();
    console.log('commands', commands);
    await harmonyClient.send('holdAction', dt_press);
    await harmonyClient.send('holdAction', dt_release);
    
    harmonyClient.end();
  } catch(error) {
    console.error('Error', error.message);
  }
}

run1().catch(
  err => console.log(err)
);