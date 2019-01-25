/// <reference types="node" />
import { EventEmitter } from 'events';
import { Explorer } from '@harmonyhub/discover';
import { Hub } from './hub';
import { HubData } from '@harmonyhub/discover';
export declare const Events: {
    DiscoveredHubs: string;
};
export declare class HomePlatform extends EventEmitter {
    log: any;
    disabled: boolean;
    discoveredHubs: Array<HubData>;
    cachedAccessories: Array<any>;
    hubMap: Map<string, any>;
    isInitialized: boolean;
    autoAddNewHubs: boolean;
    discover: Explorer;
    api: any;
    constructor(log: any, config: any, api: any);
    _finishInitialization(): Promise<void | any>;
    _finishInitializationAsync(): Promise<boolean>;
    _handleDiscoveredHub(hubInfo: HubData): Promise<{}>;
    _refreshHubAccessories(hubId: string, hub: Hub, doRegister: boolean): Promise<{}>;
    configureAccessory(accessory: any): any;
}
