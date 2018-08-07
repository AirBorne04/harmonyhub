"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug = require('debug')('harmonyhub:client:login');
var loginToHub = require('./hub');
/** Function: login
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
function login(hubhost, hubport) {
    return __awaiter(this, void 0, void 0, function* () {
        debug('login on hub ' + hubhost + (hubport ? ':' + hubport : ''));
        return loginToHub(hubhost, hubport);
    });
}
exports.login = login;
exports.default = login;
