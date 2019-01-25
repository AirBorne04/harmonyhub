import { Client as ClientNew } from '@xmpp/client';
// import { default as util } from "../../packages/client/dist/util";

const // xmppClientNew = new ClientNew(),
  debug = console.log;

// //xmppClient.on("error", function (e) {
// //   debug("XMPP login error", e);
// //   xmppClient.stop();
// // });

// // xmppClient.handle("authenticate", authenticate => {
// //   debug("authenticate client");
// //   return authenticate("sajkd@jabbers.one", "9&$%ZJX5E3C!T%RCNj%JYGKdBsTDXnrKH6U1A*z4");
// // });

// // xmppClient.once("online", () => {
// //   debug("XMPP client connected using identity token");
// // });

// xmppClientNew.on("error", (e) => {
//   debug("XMPP login error", e);
//   xmppClientNew.stop();
// });

// xmppClientNew.on("online", () => {
//   debug("XMPP client connected using identity token");
// });

// xmppClientNew.handle("authenticate", auth => {
//   debug("XMPP client authenticate with identity token");
//   return auth("sajkd", "9&$%ZJX5E3C!T%RCNj%JYGKdBsTDXnrKH6U1A*z4");
// });

// xmppClientNew.on('stanza', function (stanza) {
//   debug('server:' + stanza.toString());
// });

// xmppClientNew.on('status', (status, value) => {
//   debug('🛈', status, value ? value.toString() : '');
// });

// xmppClientNew.start("xmpp://jabbers.one");

// var logitechUrl = "https://svcs.myharmony.com/CompositeSecurityServices/Security.svc/json/GetUserAuthToken";

// // try this and skip request
// var http = require('http');

// var body = JSON.stringify({
//   email: email,
//   password: password
// });

// var request = new http.request({
//   uri: logitechUrl,
//   port: 80,
//   path: "/get_stuff",
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     "Content-Length": Buffer.byteLength(body)
//   }
// });

// request.end(body);

function getIdentity(hubhost: string, hubport: number = 0): Promise<string> {
  debug('retrieve identity by logging in as guest');

  console.log(hubhost);
  // guest@x.com / guest
  // guest@connect.logitech.com/gatorade
  return new Promise<string>((resolve, reject) => {
    let iqId;
    const xmppClient = new ClientNew();

    //   xmppClient = new Client({
    //     jid: "guest@x.com/gatorade",
    //     password: "guest",
    //     host: hubhost,
    //     port: hubport,
    //     disallowTLS: true
    //   });

    // xmppClient.on("online", function () {
    //   debug("XMPP client connected");

    //   var body = "method=pair:name=harmonyjs#iOS6.0.1#iPhone";
    //   var iq = util.buildIqStanza(
    //     "get", "connect.logitech.com", "vnd.logitech.connect/vnd.logitech.pair",
    //     body, "guest");

    //   iqId = iq.attr("id");

    //   xmppClient.send(iq);
    // });

    // xmppClient.on("error", function (e) {
    //   debug("XMPP client error", e);
    //   xmppClient.end();
    //   reject(e);
    // });

    // xmppClient.on("stanza", function (stanza) {
    //   debug("received XMPP stanza: " + stanza);

    //   if (stanza.attrs.id === iqId.toString()) {
    //     var body = stanza.getChildText("oa");
    //     var response:any = util.decodeColonSeparatedResponse(body);

    //     if (response.identity && response.identity !== undefined) {
    //       debug("received identity token: " + response.identity);
    //       xmppClient.end();
    //       resolve(response.identity);
    //     } else {
    //       debug("could not find identity token");
    //       xmppClient.end();
    //       reject(new Error("Did not retrieve identity."));
    //     }
    //   }
    // });

    xmppClient.handle('authenticate', (auth: (user: string, pwd: string) => void) => {
      debug('authenticate client');
      return auth('guest@x.com/gatorade', 'guest');

      // debug("XMPP client authenticate with identity token");
      // return auth("sajkd", "9&$%ZJX5E3C!T%RCNj%JYGKdBsTDXnrKH6U1A*z4");
    });

    // tslint:disable-next-line:no-empty
    xmppClient.on('authenticated', () => {

    });

    xmppClient.on('open', (stanza) => {
      debug('open');
      // var body = "method=pair:name=harmonyjs#iOS6.0.1#iPhone";
      // var iq = util.buildIqStanza(
      //     "get", "connect.logitech.com", "vnd.logitech.connect/vnd.logitech.pair",
      //     body, "guest");
      // iqId = iq.attr("id");
      // xmppClient.send(iq);
    });

    xmppClient.on('error', (e) => {
      debug('XMPP client error', e);
      reject(e);
      xmppClient.stop();
    });

    xmppClient.on('status', (status, value) => {
      debug('🛈', status, value ? value.toString() : '');
    });

    xmppClient.on('online', () => {
      debug('XMPP client connected');
    });

    xmppClient.start(`xmpp://${hubhost}:${hubport}`).then(
    // xmppClient.start("xmpp://jabbers.one").then(
      (res) => {
        console.log(`xmpp connection is online ${res}`);
        resolve(xmppClient);
      }
    )
    .catch(
      reject
    );
  });
}

// getIdentity("192.168.0.31", 5222).then(
//   res => debug("done " + res)
// ).catch(
//   err => console.log(err)
// );

import { getHarmonyClient } from '@harmonyhub/client';

getHarmonyClient('192.168.0.31').then(
  (harmonyClient) => {
    harmonyClient.end();
  }
);
