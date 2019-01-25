import { login } from './login';

import { HarmonyClient } from './harmonyclient';
export { HarmonyClient } from './harmonyclient';

export async function getHarmonyClient(hubhost: string, options?: number |
  { port?: number, remoteId?: string }): Promise<HarmonyClient> {
  // map a pure number to the options object
  if (typeof options === 'number') {
    options = {
      port: options
    };
  }
  // the xmpp client does not require a remoteId?
  const xmppClient = await login(hubhost, options.port);
  return new HarmonyClient(xmppClient);
}

export default getHarmonyClient;
