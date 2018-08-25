var getHarmonyClient = require("../../packages/client/dist").getHarmonyClient;

function test() {
  getHarmonyClient('192.168.0.31').then(
    (harmonyClient) => {
      return harmonyClient.getAvailableCommands().then((commands) => {

        // Look for the first device and pick its "power" control group, pick
        // there the "poweron" function and trigger it:
        var device = commands.device[0];

        var powerControls = device.controlGroup
            .filter(function (group) { return group.name.toLowerCase() === 'power' })
            .pop();

            var powerOnFunction = powerControls['function']
            .filter(function (action) { return action.name.toLowerCase() === 'poweron' })
            .pop();

        if (powerOnFunction) {
          var encodedAction = powerOnFunction.action.replace(/\:/g, '::');
          harmonyClient.send('holdAction', 'action=' + encodedAction + ':status=press');
        } else {
          throw new Error('could not find poweron function of first device :(');
        }
      })
      .then( () => harmonyClient.end() );
  })
  .catch(
    (err) => console.log(err)
  );
}

test();

