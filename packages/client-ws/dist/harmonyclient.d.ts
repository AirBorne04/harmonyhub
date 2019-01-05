/// <reference types="node" />
import { EventEmitter } from "events";
/**
 * Creates a new HarmonyClient using the given xmppClient to communication.
 */
export declare class HarmonyClient extends EventEmitter {
    private _wsClient;
    private _remoteId;
    private _interval;
    connect(hubip: string): any;
    private _getRemoteId;
    private _connect;
    _onMessage(message: any): void;
    /**
     * The state digest is caused by the hub to let clients know about remote updates
     * @param {message} stateDigest
     */
    onStateDigest(stateDigest: any): void;
    /**
     * Returns the latest turned on activity from a hub.
     *
     * @returns Promise<string>
     */
    getCurrentActivity(): Promise<string>;
    /**
     * Retrieves a list with all available activities.
     */
    getActivities(): Promise<HarmonyClient.ActivityDescription[]>;
    /**
     * Starts an activity with the given id.
     */
    startActivity(activityId: any): Promise<{}>;
    /**
     * Turns the currently running activity off. This is implemented by "starting" an imaginary activity with the id -1.
     */
    turnOff(): Promise<{}>;
    /**
     * Checks if the hub has now activity turned on. This is implemented by checking the hubs current activity. If the
     * activities id is equal to -1, no activity is on currently.
     */
    isOff(): Promise<boolean>;
    /**
     * Acquires all available commands from the hub when resolving the returned promise.
     */
    getAvailableCommands(): Promise<HarmonyClient.ConfigDescription>;
    /**
     * Closes the connection the the hub. You have to create a new client if you would like
     * to communicate again with the hub.
     */
    end(): void;
}
export declare namespace HarmonyClient {
    enum Events {
        STATE_DIGEST = "stateDigest"
    }
    class ConfigDescription {
        activity: Array<ActivityDescription>;
        device: Array<DeviceDescription>;
    }
    class ActivityDescription {
        id: string;
        type: string;
        label: string;
        isTuningDefault?: boolean;
        activityTypeDisplayName: string;
        rules: Array<any>;
        activityOrder?: number;
        KeyboardTextEntryActivityRole?: string;
        ChannelChangingActivityRole?: string;
        VolumeActivityRole?: string;
        enterActions: Array<any>;
        fixit: Array<any>;
        zones?: any;
        suggestedDisplay: string;
        isAVActivity: boolean;
        sequences: Array<any>;
        controlGroup: Array<any>;
        roles: Array<any>;
        isMultiZone?: boolean;
        icon: string;
        baseImageUri?: string;
        imageKey?: string;
    }
    class DeviceDescription {
        label: string;
        deviceAddedDate: string;
        ControlPort: number;
        contentProfileKey: number;
        deviceProfileUri: string;
        manufacturer: string;
        icon: string;
        suggestedDisplay: string;
        deviceTypeDisplayName: string;
        powerFeatures: Array<any>;
        Capabilities: Array<any>;
        controlGroup: Array<any>;
        DongleRFID: number;
        IsKeyboardAssociated: boolean;
        model: string;
        type: string;
        id: string;
        Transport: number;
        isManualPower: boolean;
    }
}
export default HarmonyClient;
