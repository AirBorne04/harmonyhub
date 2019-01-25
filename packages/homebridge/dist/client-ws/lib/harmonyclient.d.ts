/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * Creates a new HarmonyClient using the given xmppClient to communication.
 */
export declare class HarmonyClient extends EventEmitter {
    private wsClient;
    private remoteId;
    private heartbeatInterval;
    connect(hubip: string): any;
    private _getRemoteId;
    private _connect;
    _onMessage(message: any): void;
    /**
     * The state digest is caused by the hub to let clients know about remote updates
     * @param {message} stateDigest
     */
    private onStateDigest;
    /**
     * Returns the latest turned on activity from a hub.
     *
     * @returns Promise<string>
     */
    getCurrentActivity(): Promise<string>;
    /**
     * Retrieves a list with all available activities.
     */
    getActivities(): Promise<Array<HarmonyClient.ActivityDescription>>;
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
     * sends a command to the hub, including the press action and the release after the command_timeframe
     * @param action action name usually 'holdAction'
     * @param body
     * @param commandTimeframe the time when to send a release message
     */
    send(action: string, body: string | {
        command: string;
        deviceId: string;
        type?: string;
    }, commandTimeframe?: number): Promise<{}>;
    /**
     * Closes the connection the the hub. You have to create a new client if you would like
     * to communicate again with the hub.
     */
    end(): void;
}
export declare namespace HarmonyClient {
    enum Events {
        STATE_DIGEST = "stateDigest",
        CONNECTED = "open",
        DISCONNECTED = "close"
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
        fixit: any;
        zones?: any;
        suggestedDisplay: string;
        isAVActivity: boolean;
        sequences: Array<any>;
        controlGroup: Array<ControlGroup>;
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
        powerFeatures: PowerFeatures;
        Capabilities: Array<number>;
        controlGroup: Array<ControlGroup>;
        DongleRFID: number;
        IsKeyboardAssociated: boolean;
        model: string;
        type: string;
        id: string;
        Transport: number;
        isManualPower: boolean;
    }
    class PowerFeatures {
        PowerOffActions: PowerAction;
        PowerOnActions: PowerAction;
    }
    class PowerAction {
        __type: string;
        IRCommandName: string;
        Order: number;
        Duration: any;
        ActionId: number;
    }
    class ControlGroup {
        name: string;
        function: Array<FunctionObj>;
    }
    class FunctionObj {
        action: string;
        name: string;
        label: string;
    }
    class StateDigest {
        activityId: string;
        activityStatus: StateDigestStatus;
        sleepTimerId: number;
        runningZoneList: Array<{}>;
        contentVersion: number;
        errorCode: ERROR_CODE;
        syncStatus: number;
        time: number;
        stateVersion: number;
        tzoffset: string;
        tzOffset: string;
        mode: number;
        hubSwVersion: string;
        deviceSetupState: Array<{}>;
        isSetupComplete: boolean;
        configVersion: number;
        sequence: boolean;
        discoveryServer: string;
        discoveryServerCF: string;
        updates: any;
        wifiStatus: number;
        tz: string;
        activitySetupState: boolean;
        runningActivityList: string;
        hubUpdate: boolean;
        accountId: string;
    }
    enum StateDigestStatus {
        HUB_IS_OFF = 0,
        ACTIVITY_STARTING = 1,
        ACTIVITY_STARTED = 2,
        HUB_TURNING_OFF = 3
    }
    enum ERROR_CODE {
        OK = "200"
    }
}
export default HarmonyClient;
