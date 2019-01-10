import { HarmonyClient } from './harmonyclient';
export { HarmonyClient } from './harmonyclient';

export async function getHarmonyClient(hubhost: string, hubport?: number): Promise<HarmonyClient> {
  // make new harmony hub client
  const harmonyClient = new HarmonyClient();
  await harmonyClient.connect(hubhost);
  return harmonyClient;
}

export default getHarmonyClient;