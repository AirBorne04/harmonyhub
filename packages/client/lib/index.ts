import { login } from './login';
import { HarmonyClient } from './harmonyclient';

export async function getHarmonyClient(hubhost: string, hubport?: number): Promise<HarmonyClient> {
  var xmppClient = await login(hubhost, hubport);
  return new HarmonyClient(xmppClient);
}

export default getHarmonyClient;