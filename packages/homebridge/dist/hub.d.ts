import { HubConnection } from "./hub-connection";
export declare class Hub {
    connection: HubConnection;
    log: any;
    _accessories: any;
    constructor(log: any, connection?: HubConnection);
    updateConnection(connection: any): void;
    getAccessoriesAsync(): Promise<any>;
    updateAccessoriesAsync(cachedAccessories?: any): Promise<any[]>;
}
