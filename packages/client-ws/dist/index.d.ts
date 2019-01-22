import { HarmonyClient } from './harmonyclient';
export { HarmonyClient } from './harmonyclient';
export declare function getHarmonyClient(hubhost: string, timeout?: number): Promise<HarmonyClient>;
export declare function getHarmonyClientWithDiscovery(discovery: any, timeout?: number): Promise<HarmonyClient>;
export default getHarmonyClient;
