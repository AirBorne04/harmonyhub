"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_xmpp_stanza_1 = require("node-xmpp-stanza");
function getUniqueId() {
    return Math.floor(Math.random() * 1000000);
}
/**
 * Splits a response from the hub (usualy seperated by ":" and "=") into a
 * proper javascript object.
 */
function decodeColonSeparatedResponse(response) {
    let result;
    if (response && typeof response === 'string') {
        const pairs = response.split(':') || [response];
        result = {};
        pairs.forEach((pair) => {
            const keyValue = pair.split('=');
            if (keyValue.length === 2) {
                result[keyValue[0]] = keyValue[1];
            }
        });
    }
    return result;
}
function buildIqStanza(type, xmlns, mime, body, from) {
    const iq = new node_xmpp_stanza_1.IQ({
        type,
        id: getUniqueId(),
        from
    });
    iq.c('oa', {
        xmlns,
        mime
    }).t(body);
    return iq;
}
exports.default = {
    getUniqueId,
    decodeColonSeparatedResponse,
    buildIqStanza
};
