import { HubAccessoryBase } from './hub-accessory-base';
import { HubConnection } from './hub-connection';
import { HarmonyClient } from '../../client-ws/lib/harmonyclient';
export declare function ActivityAccessoryInit(exportedTypes: any): typeof ActivityAccessory;
export declare const ActivityStatus: {
    Off: number;
    Starting: number;
    Started: number;
    TurningOff: number;
};
export declare class ActivityAccessory extends HubAccessoryBase {
    static typeKey: string;
    currentActivity: any;
    constructor(accessory: any, log: any, connection: any);
    static createAsync(accessory: any, log: any, connection: any): Promise<ActivityAccessory>;
    onConnectionChanged(connStatus: any): void;
    onStateChanged(args: HarmonyClient.StateDigest): void;
    initConnection(): Promise<void>;
    updateConnection(connection: HubConnection): void;
    _updateActivities(list: any): void;
    _updateActivityState(currentActivity?: any): void;
    refreshActivityAsync(): Promise<void | any>;
    _getActivityService(activity: any): any;
    _getActivityServices(): any;
    _bindService(service: any): void;
    _setActivityServiceOn(service: any, isOn: any, callback: any, doIgnore: any): Promise<void>;
}
