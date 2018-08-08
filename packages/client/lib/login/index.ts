import * as logger from "debug";
var debug = logger("harmonyhub:client:login");

import { loginToHub } from "./hub";

/** Function: login
 * Retrieves a UserAuthToken using a guest Harmony account and logs into a
 * local Harmony hub. If everything runs fine, the returned promise resolves by
 * passing a logged in XMPP client which provides communication to the Hamrony
 * hub.
 */
export function login(hubhost: string, hubport: number): Promise<{}> {
  debug('login on hub ' + hubhost + (hubport ? ':' + hubport : ''));
  return loginToHub(hubhost, hubport);
}

export default login;