/** Function: login
<<<<<<< HEAD
 * Retrieves a UserAuthToken using a guest Harmony account and logs into a
 * local Harmony hub. If everything runs fine, the returned promise resolves by
 * passing a logged in XMPP client which provides communication to the Hamrony
 * hub.
 */
export declare function login(hubhost: string, hubport: number): Promise<{}>;
=======
 * Retrieves a UserAuthToken using a valid Harmony account and logs in to a
 * local Harmony hub. If everything runs fine, the returned promise resolves by
 * passing a logged in XMPP client which provied communications to the Hamrony
 * hub.
 *
 * Parameters:
 *     (String) email - E-mail address of a Harmony account
 *     (String) password - Password of a Harmony account
 *     (String) hubhost - Hostname/IP of the Harmony hub to login to.
 *     (int) hubport - Optional. Port of the Harmony hub to login to.
 *
 * Returns:
 *     (Promise) - When resolved, the promise passes a prepared XMPP client,
 *                   ready to communicate with the Harmony hub.
 */
export declare function login(hubhost: any, hubport: any): Promise<any>;
>>>>>>> converted project into typescript
export default login;
