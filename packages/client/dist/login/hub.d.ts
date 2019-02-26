/** Function: loginToHub
 * Uses a guest account to log into the hub defined by the host
 * and port.
 * The returned promise will pass a fully authenticated XMPP client
 * which can be used to communicate with the Harmony hub.
 */
export declare function loginToHub(hubhost: string, hubport?: number): Promise<{}>;
export default loginToHub;
