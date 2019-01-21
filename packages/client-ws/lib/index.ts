import { HarmonyClient } from './harmonyclient';
export { HarmonyClient } from './harmonyclient';

export async function getHarmonyClient(hubhost: string, timeout?: number): Promise<HarmonyClient> {
  // make new harmony hub client
  const harmonyClient = new HarmonyClient();
  await harmonyClient.connect(hubhost, timeout);
  return harmonyClient;
}

export async function getHarmonyClientWithDiscovery(discovery: any, timeout?: number): Promise<HarmonyClient> {
  // make new harmony hub client from discovery object
  const harmonyClient = new HarmonyClient();
  await harmonyClient.connectWithDiscovery(discovery, timeout);
  return harmonyClient;
}

export default getHarmonyClient;