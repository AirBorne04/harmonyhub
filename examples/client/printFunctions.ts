import { HarmonyClient } from '@harmonyhub/client';
import { HubReporter } from './setup';

const hubReporter = new HubReporter();

hubReporter.on( HarmonyClient.Events.CONNECTED, async (harmonyClient: HarmonyClient) => {
  try {
    // get all activities
    const activities = await harmonyClient.getActivities();
    console.log(
      'available activities',
      activities.map(
        (activity) => activity.label
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
      (dev) => dev.type === 'Television'
    );
    console.log(
      'Functions for television',
      tv.controlGroup.map(
        (control) => `${control.name} [${control.function.map((func) => func.name)}]`
      )
    );

    harmonyClient.end();
  } catch (error) {
    console.error('Error', error.message);
  }
} );

hubReporter.start();
console.log('listening for 10 seconds to retrieve hub infos from the network');
setTimeout( () => hubReporter.stop(), 10 * 1000 );
