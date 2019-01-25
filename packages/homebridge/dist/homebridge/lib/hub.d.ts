import { ActivityAccessory } from './activity-accessory';
import { HubConnection } from './hub-connection';
export declare class Hub {
    connection: HubConnection;
    log: any;
    accessories: Array<ActivityAccessory>;
    constructor(log: any, connection?: HubConnection);
    updateConnection(connection: any): void;
    getAccessoriesAsync(): Promise<ActivityAccessory[]>;
    updateAccessories(cachedAccessories?: any): Promise<ActivityAccessory[]>;
}
