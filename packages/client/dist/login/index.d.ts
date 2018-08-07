/** Function: login

 * Retrieves a UserAuthToken using a guest Harmony account and logs into a
 * local Harmony hub. If everything runs fine, the returned promise resolves by
 * passing a logged in XMPP client which provides communication to the Hamrony
 * hub.
 */
export declare function login(hubhost: string, hubport: number): Promise<{}>;
export default login;
