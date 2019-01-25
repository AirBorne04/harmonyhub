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
  // create the client based on options, the websocket client does not need a port
  const harmonyClient = new HarmonyClient();
  await harmonyClient.connect(hubhost, options.remoteId);
  return harmonyClient;
}

export default getHarmonyClient;
