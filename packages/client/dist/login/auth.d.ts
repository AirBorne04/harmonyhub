/** Function: getUserAuthToken
 * Connects to Logitechs web service to retrieve a userAuthToken. This token
 * then can be used to login to a Harmony hub as guest.
<<<<<<< HEAD
 */
export declare function getUserAuthToken(email: string, password: string): Promise<string>;
=======
 *
 * Parameters:
 *     (String) email - E-mail address of a Harmony account
 *     (String) password - Password of a Harmony account
 *
 * Returns:
 *     (Promise) - When resolved, passes the userAuthToken.
 */
export declare function getUserAuthToken(email: any, password: any): Promise<{}>;
>>>>>>> converted project into typescript
export default getUserAuthToken;
