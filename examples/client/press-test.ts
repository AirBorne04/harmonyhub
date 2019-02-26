import { getHarmonyClient } from '@harmonyhub/client';

async function prep() {
  const harmonyClient = await getHarmonyClient('192.168.0.31');

  const commands: any = await harmonyClient.getAvailableCommands();
  // console.log('commands', commands);

  console.log(
    commands
  );

  return {
    client: harmonyClient,
    commands,
    tvDeviceId: commands.device.filter(
      (com) => com.type === 'StereoReceiver' // Television
    )[0].id
  };
}

/**
 * run volume up followed with release -> 0,5
 */
async function run1(): Promise<void> {
  const { client, tvDeviceId } = await prep();

  const encodedAction = `{"command"::"VolumeUp","type"::"IRCommand","deviceId"::"${tvDeviceId}"}`;
  const dtPress = `action=${encodedAction}:status=press`;
  const dtRelease = `action=${encodedAction}:status=release`;

  try {
    await client.send('holdAction', dtPress);
    await client.send('holdAction', dtRelease);

    client.end();
  } catch (error) {
    console.error('Error', error.message);
  }
}

/**
 * run volume up with release in parallel -> 0,5
 */
async function run2(): Promise<void> {
  const { client, tvDeviceId } = await prep();

  const encodedAction = `{"command"::"VolumeUp","type"::"IRCommand","deviceId"::"${tvDeviceId}"}`;
  const dtPress = `action=${encodedAction}:status=press`;
  const dtRelease = `action=${encodedAction}:status=release`;

  try {
    client.send('holdAction', dtPress);
    client.send('holdAction', dtRelease);

    client.end();
  } catch (error) {
    console.error('Error', error.message);
  }
}

/**
 * run volume up without release -> 1.0
 */
async function run3(): Promise<void> {
  const { client, tvDeviceId } = await prep();

  const encodedAction = `{"command"::"VolumeUp","type"::"IRCommand","deviceId"::"${tvDeviceId}"}`;
  const dtPress = `action=${encodedAction}:status=press`;

  try {
    await client.send('holdAction', dtPress);
    client.end();
  } catch (error) {
    console.error('Error', error.message);
  }
}

/**
 * run multiple volume up -> 2.0
 */
async function runMulti1(): Promise<void> {
  const { client, tvDeviceId } = await prep();

  const encodedAction = `{"command"::"VolumeUp","type"::"IRCommand","deviceId"::"${tvDeviceId}"}`;
  const dtPress = `action=${encodedAction}:status=press`;

  try {
    await client.send('holdAction', dtPress);
    await client.send('holdAction', dtPress);
    await client.send('holdAction', dtPress);
    client.end();
  } catch (error) {
    console.error('Error', error.message);
  }
}

/**
 * run multiple volume up -> 2.0
 */
async function runMulti2(): Promise<void> {
  const { client, tvDeviceId } = await prep();

  const encodedAction = `{"command"::"VolumeUp","type"::"IRCommand","deviceId"::"${tvDeviceId}"}`;
  const dtPress = `action=${encodedAction}:status=press`;

  try {
    client.send('holdAction', dtPress);
    client.send('holdAction', dtPress);
    await client.send('holdAction', dtPress);
    client.end();
  } catch (error) {
    console.error('Error', error.message);
  }
}

/**
 * run multiple volume up -> 9.0
 */
async function runMulti3(): Promise<void> {
  const { client, tvDeviceId } = await prep();

  const encodedAction = `{"command"::"VolumeUp","type"::"IRCommand","deviceId"::"${tvDeviceId}"}`;
  const dtPress = `action=${encodedAction}:status=press`;

  try {
    for (let i = 0; i < 10; ++i) {
      await client.send('holdAction', dtPress);
    }
    client.end();
  } catch (error) {
    console.error('Error', error.message);
  }
}

run1().catch(
  (err) => console.log(err)
);
