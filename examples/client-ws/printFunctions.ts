import { getHarmonyClient } from '../../packages/client-ws/dist';

async function run() {
  const harmonyClient = await getHarmonyClient("192.168.0.30");

  try {
    // get all activities
    const activities = await harmonyClient.getActivities();
    console.log(
      'available activities',
      activities.map(
        activity => activity.label
      )
    );
    
    // get all devices
    const commands = await harmonyClient.getAvailableCommands();
    console.log(
      'devices',
      commands.device.map(
        (dev) => dev.label + dev.type
      )
    );

    // print television functions
    const tv = commands.device.find(
      dev => dev.type === 'Television'
    );
    console.log(
      'Functions for television',
      tv.controlGroup.map(
        (control) => `${control.name} [${control.function.map(func => func.name)}]`
      )
    );

    harmonyClient.end();
  } catch(error) {
    console.error('Error', error.message);
  }
}

run().catch(
  err => console.log(err)
);