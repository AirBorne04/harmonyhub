import { HarmonyClient } from './harmonyclient';
export { HarmonyClient } from './harmonyclient';

export async function getHarmonyClient(hubhost: string, options?: number |
    { port?: number, remoteId?: string }): Promise<HarmonyClient> {
  // make new harmony hub client
  if (typeof options === 'number') {
    options = {
      port: options
    };
  }
  // create the client based on options
  const harmonyClient = new HarmonyClient();
  await harmonyClient.connect(hubhost, options.remoteId);
  return harmonyClient;
}

export default getHarmonyClient;
