/**
 * Base class for all accessories in this plugin
 */
export declare function AccessoryBaseInit(exportedTypes: any): typeof AccessoryBase;
export declare class AccessoryBase {
    log: any;
    accessory: any;
    constructor(accessory: any, idKey: any, name: any, log: any);
    getService(info: any): void;
}
