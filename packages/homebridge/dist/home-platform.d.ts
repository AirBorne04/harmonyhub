/// <reference types="node" />
import { EventEmitter } from "events";
import { Explorer } from "@harmonyhub/discover";
export declare const Events: {
    DiscoveredHubs: string;
};
export declare class HomePlatform extends EventEmitter {
    log: any;
    disabled: boolean;
    _discoveredHubs: Array<any>;
    _cachedAccessories: Array<any>;
    _hubMap: Map<string, any>;
    _isInitialized: boolean;
    _autoAddNewHubs: boolean;
    _discover: Explorer;
    _api: any;
    constructor(log: any, config: any, api: any);
    _finishInitialization(): Promise<void | any>;
    _finishInitializationAsync(): Promise<boolean>;
    _handleDiscoveredHubAsync(hubInfo: any): Promise<{}>;
    _refreshHubAccessoriesAsync(hubId: any, hub: any, doRegister: boolean): Promise<{}>;
    configureAccessory(accessory: any): any;
}
