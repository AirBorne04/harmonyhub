var login = require('./login');
var HarmonyClient = require('./harmonyclient');

function getHarmonyClient (hubhost, hubport) {
  return login(hubhost, hubport)
    .then(xmppClient => {
      console.log("running");
      return new HarmonyClient(xmppClient)
    });
}

module.exports = getHarmonyClient;
