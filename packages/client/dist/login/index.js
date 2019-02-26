"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("debug");
const debug = logger('harmonyhub:client:login');
const hub_1 = require("./hub");
/** Function: login
 * Retrieves a UserAuthToken using a guest Harmony account and logs into a
 * local Harmony hub. If everything runs fine, the returned promise resolves by
 * passing a logged in XMPP client which provides communication to the Harmony
 * hub.
 */
function login(hubhost, hubport) {
    debug('login on hub ' + hubhost + (hubport ? ':' + hubport : ''));
    return hub_1.loginToHub(hubhost, hubport);
}
exports.login = login;
exports.default = login;
