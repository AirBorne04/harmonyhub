import { HarmonyClient } from './harmonyclient';
export { HarmonyClient } from './harmonyclient';
export declare function getHarmonyClient(hubhost: string, options?: number | {
    port?: number;
    remoteId?: string;
}): Promise<HarmonyClient>;
export default getHarmonyClient;
