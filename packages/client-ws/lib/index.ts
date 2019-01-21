import { HarmonyClient } from './harmonyclient';
export { HarmonyClient } from './harmonyclient';

export async function getHarmonyClient(hubhost: string, hubport?: number): Promise<HarmonyClient> {
  // make new harmony hub client
  const harmonyClient = new HarmonyClient();
  await harmonyClient.connect(hubhost);
  return harmonyClient;
}

export async function getHarmonyClientWithDiscovery(discovery: any): Promise<HarmonyClient> {
  // make new harmony hub client from discovery object
  const harmonyClient = new HarmonyClient();
  await harmonyClient.connectWithDiscovery(discovery);
  return harmonyClient;
}

export default getHarmonyClient;