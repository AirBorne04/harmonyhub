import { getHarmonyClient } from "../../packages/client-ws/dist";

async function run(): Promise<void> {
  const harmonyClient = await getHarmonyClient("192.168.0.30");

  // const encodedAction = `{"command"::"VolumeUp","type"::"IRCommand","deviceId"::"27633596"}`;
  // const dt_press = `action=${encodedAction}:status=press`;
  // const dt_release = `action=${encodedAction}:status=release`;

  try {
    const commands = await harmonyClient.getAvailableCommands(),
          device = commands.device[0],
          powerControls = device.controlGroup
            .filter(function (group) { return group.name.toLowerCase() === 'volume' })
            .pop(),
          powerOnFunction = powerControls['function']
            .filter(function (action) { return action.name.toLowerCase() === 'volumeup' })
            .pop();

    if (powerOnFunction) {
      // console.log(powerOnFunction.action);

      // var encodedAction = powerOnFunction.action.replace(/\:/g, '::');
      await harmonyClient.send('holdAction', powerOnFunction.action, 100);
    } else {
      throw new Error('could not find poweron function of first device :(');
    }

    // console.log(
    //   commands.device[0].controlGroup[0]
    // )

    // harmonyClient.turnOff();
    
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