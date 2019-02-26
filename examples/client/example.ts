import { getHarmonyClient } from '@harmonyhub/client';

async function run(): Promise<void> {
  const harmonyClient = await getHarmonyClient('192.168.0.31');

  const encodedAction = `{"command"::"VolumeUp","type"::"IRCommand","deviceId"::"27633596"}`;
  const dtPress = `action=${encodedAction}:status=press`;
  const dtRelease = `action=${encodedAction}:status=release`;

  try {
    const commands = await harmonyClient.getAvailableCommands();
    console.log('commands', commands);
    await harmonyClient.send('holdAction', dtPress);
    await harmonyClient.send('holdAction', dtRelease);

    harmonyClient.end();
  } catch (error) {
    console.error('Error', error.message);
  }
}

async function run1(): Promise<void> {
  const harmonyClient = await getHarmonyClient('192.168.0.102');

  const commands = await harmonyClient.getAvailableCommands(),
        tvs = commands.device.filter(
          (device) => device.type === 'Television'
        );

  console.log('televisions found #' + tvs.length);
  return Promise.resolve();
}

run1().catch(
  (err) => console.log(err)
);
