import { login } from './login';
import { HarmonyClient } from './harmonyclient';

export async function getHarmonyClient(hubhost: string, hubport: number): Promise<HarmonyClient> {
  
  return login(hubhost, hubport)
    .then(xmppClient => {
      return new HarmonyClient(xmppClient);
    });
}

export default getHarmonyClient;