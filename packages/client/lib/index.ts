var login = require('./login');
import { HarmonyClient } from './harmonyclient';

export function getHarmonyClient(hubhost, hubport): HarmonyClient {
  return login(hubhost, hubport)
    .then(xmppClient => {
      return new HarmonyClient(xmppClient);
    });
}

export default getHarmonyClient;