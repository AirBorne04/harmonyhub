"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("debug");
var debug = logger("harmonyhub:client:login:hub");
const node_xmpp_client_1 = require("node-xmpp-client");
// import { Client as ClientNew } from "@xmpp/client";
const util_1 = require("../util");
/** PrivateFunction: getIdentity
 * Logs in to a Harmony hub as a guest and uses the userAuthToken from logitech"s
 * web service to retrieve an identity token.
 *
 * Parameters:
 *     (String) hubhost - Hostname/IP of the Harmony hub to connect.
 *     (int) hubport - Optional. Port of the Harmony hub to connect. By default,
 *                     this is set to 5222.
 *
 * Returns:
 *     (Promise) - The resolved promise passes the retrieved identity token.
 */
function getIdentity(hubhost, hubport) {
    debug("retrieve identity by logging in as guest");
    // guest@x.com / guest
    // guest@connect.logitech.com/gatorade
    return new Promise((resolve, reject) => {
        var iqId, xmppClient = new node_xmpp_client_1.Client({
            jid: "guest@x.com/gatorade",
            password: "guest",
            host: hubhost,
            port: hubport,
            disallowTLS: true,
            reconnect: true
        });
        xmppClient.on("online", function () {
            debug("XMPP client connected");
            var body = "method=pair:name=harmonyjs#iOS6.0.1#iPhone";
            var iq = util_1.default.buildIqStanza("get", "connect.logitech.com", "vnd.logitech.connect/vnd.logitech.pair", body, "guest");
            iqId = iq.attr("id");
            xmppClient.send(iq);
        });
        xmppClient.on("error", function (e) {
            debug("XMPP client error", e);
            xmppClient.end();
            reject(e);
        });
        xmppClient.on("stanza", function (stanza) {
            debug("received XMPP stanza: " + stanza);
            if (stanza.attrs.id === iqId.toString()) {
                var body = stanza.getChildText("oa");
                var response = util_1.default.decodeColonSeparatedResponse(body);
                if (response.identity && response.identity !== undefined) {
                    debug("received identity token: " + response.identity);
                    xmppClient.end();
                    resolve(response.identity);
                }
                else {
                    debug("could not find identity token");
                    xmppClient.end();
                    reject(new Error("Did not retrieve identity."));
                }
            }
        });
        // xmppClient.handle("authenticate", authenticate => {
        //   debug("authenticate client");
        //   return authenticate("guest@x.com/gatorade", "guest");
        // });
        // xmppClient.start("xmpp://" + hubhost + ":" + hubport);
    });
}
/** PrivateFunction: loginWithIdentity
 * After fetching an identity from the Harmony hub, this function creates an
 * XMPP client using that identity. It returns a promise which, when resolved,
 * passes that XMPP client.
 */
function loginWithIdentity(identity, hubhost, hubport) {
    debug("create xmpp client using retrieved identity token: " + identity);
    return new Promise((resolve, reject) => {
        var jid = identity + "@connect.logitech.com/gatorade", password = identity, xmppClient = new node_xmpp_client_1.Client({
            jid: jid,
            password: password,
            host: hubhost,
            port: hubport,
            disallowTLS: true
        });
        // xmppClientNew = new ClientNew();
        xmppClient.on("error", function (e) {
            debug("XMPP login error", e);
            xmppClient.end();
            reject(e);
        });
        xmppClient.once("online", function () {
            debug("XMPP client connected using identity token");
            resolve(xmppClient);
        });
        // xmppClientNew.on("error", function (e) {
        //   debug("XMPP login error", e);
        //   xmppClientNew.stop();
        //   reject(e);
        // });
        // xmppClientNew.once("online", function () {
        //   debug("XMPP client connected using identity token");
        //   resolve(xmppClientNew);
        // });
        // xmppClientNew.handle("authenticate", auth => {
        //   debug("XMPP client authenticate with identity token");
        //   auth(jid, password);
        // });
        // xmppClientNew.start(`xmpp://${hubhost}:${hubport}`);
    });
}
/** Function: loginToHub
 * Uses a guest account to log into the hub defined by the host
 * and port.
 * The returned promise will pass a fully authenticated XMPP client
 * which can be used to communicate with the Harmony hub.
 */
function loginToHub(hubhost, hubport) {
    debug("perform hub login");
    hubport = hubport || 5222;
    return getIdentity(hubhost, hubport)
        .then(function (identity) {
        debug("first step is done now login with identity");
        return loginWithIdentity(identity, hubhost, hubport);
    });
}
exports.loginToHub = loginToHub;
exports.default = loginToHub;
