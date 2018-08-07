<<<<<<< HEAD
declare const _default: {
    getUniqueId: () => number;
    decodeColonSeparatedResponse: (response: string) => Object;
    buildIqStanza: (type: string, xmlns: string, mime: string, body: string, from?: string) => any;
=======
declare function getUniqueId(): number;
/**
 * Splits a response from the hub (usualy seperated by ':' and '=') into a
 * proper javascript object.
 *
 * Parameters:
 *     (String) response
 *
 * Returns:
 *     (Object)
 */
declare function decodeColonSeparatedResponse(response: string): Object;
declare function buildIqStanza(type: any, xmlns: any, mime: any, body: any, from?: any): any;
declare const _default: {
    getUniqueId: typeof getUniqueId;
    decodeColonSeparatedResponse: typeof decodeColonSeparatedResponse;
    buildIqStanza: typeof buildIqStanza;
>>>>>>> converted project into typescript
};
export default _default;
