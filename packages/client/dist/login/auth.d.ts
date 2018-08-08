/** Function: getUserAuthToken
 * Connects to Logitechs web service to retrieve a userAuthToken. This token
 * then can be used to login to a Harmony hub as guest.
 */
export declare function getUserAuthToken(email: string, password: string): Promise<string>;
export default getUserAuthToken;
