"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var login = require('./login');
const harmonyclient_1 = require("./harmonyclient");
function getHarmonyClient(hubhost, hubport) {
    return login(hubhost, hubport)
        .then(xmppClient => {
        return new harmonyclient_1.HarmonyClient(xmppClient);
    });
}
exports.getHarmonyClient = getHarmonyClient;
exports.default = getHarmonyClient;
