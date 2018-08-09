declare function getUniqueId(): number;
/**
 * Splits a response from the hub (usualy seperated by ":" and "=") into a
 * proper javascript object.
 */
declare function decodeColonSeparatedResponse(response: string): Object;
declare function buildIqStanza(type: string, xmlns: string, mime: string, body: string, from?: string): any;
declare const _default: {
    getUniqueId: typeof getUniqueId;
    decodeColonSeparatedResponse: typeof decodeColonSeparatedResponse;
    buildIqStanza: typeof buildIqStanza;
};
export default _default;
