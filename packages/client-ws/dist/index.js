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
const harmonyclient_1 = require("./harmonyclient");
var harmonyclient_2 = require("./harmonyclient");
exports.HarmonyClient = harmonyclient_2.HarmonyClient;
function getHarmonyClient(hubhost, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        // make new harmony hub client
        const harmonyClient = new harmonyclient_1.HarmonyClient();
        yield harmonyClient.connect(hubhost, timeout);
        return harmonyClient;
    });
}
exports.getHarmonyClient = getHarmonyClient;
function getHarmonyClientWithDiscovery(discovery, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        // make new harmony hub client from discovery object
        const harmonyClient = new harmonyclient_1.HarmonyClient();
        yield harmonyClient.connectWithDiscovery(discovery, timeout);
        return harmonyClient;
    });
}
exports.getHarmonyClientWithDiscovery = getHarmonyClientWithDiscovery;
exports.default = getHarmonyClient;
