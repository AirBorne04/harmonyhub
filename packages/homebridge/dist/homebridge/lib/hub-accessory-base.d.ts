import { AccessoryBase } from './accessory-base';
import { HubConnection, HubConnectionStatus } from './hub-connection';
export declare function HubAccessoryBaseInit(exportedTypes: any): typeof HubAccessoryBase;
export declare class HubAccessoryBase extends AccessoryBase {
    connection: HubConnection;
    constructor(accessory: any, connection: HubConnection, idKey: any, name: any, log: any);
    updateConnection(connection: HubConnection): void;
    _updateConnectionStatus(connStatus: HubConnectionStatus): void;
    refreshHubInfo(): void;
}
