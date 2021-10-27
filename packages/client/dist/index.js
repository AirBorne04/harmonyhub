"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHarmonyClient = exports.HarmonyClient = void 0;
const login_1 = require("./login");
const harmonyclient_1 = require("./harmonyclient");
var harmonyclient_2 = require("./harmonyclient");
Object.defineProperty(exports, "HarmonyClient", { enumerable: true, get: function () { return harmonyclient_2.HarmonyClient; } });
function getHarmonyClient(hubhost, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        // map a pure number to the options object
        if (typeof options === 'number') {
            options = {
                port: options
            };
        }
        // the xmpp client does not require a remoteId! or port! it will fallback to 5222
        const xmppClient = yield (0, login_1.login)(hubhost, options.port);
        return new harmonyclient_1.HarmonyClient(xmppClient);
    });
}
exports.getHarmonyClient = getHarmonyClient;
exports.default = getHarmonyClient;
