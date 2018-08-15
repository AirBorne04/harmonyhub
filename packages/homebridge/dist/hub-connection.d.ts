/// <reference types="node" />
import { Explorer } from "@harmonyhub/discover";
import { EventEmitter } from "events";
import { HarmonyClient } from "@harmonyhub/client/dist/harmonyclient";
export declare const HubConnectionEvents: {
    ConnectionChanged: string;
    StateDigest: string;
};
export declare enum HubConnectionStatus {
    Unknown = 0,
    Connecting = 1,
    Connected = 2,
    PendingConnection = 3,
    Disconnected = 4
}
export declare class HubConnection extends EventEmitter {
    readonly status: HubConnectionStatus;
    log: any;
    hubInfo: {
        uuid: any;
        ip: any;
    };
    _discover: Explorer;
    client: HarmonyClient;
    _connTask: Promise<HarmonyClient>;
    _lastStatus: HubConnectionStatus;
    static createAsync(hubInfo: {
        uuid: any;
        ip: any;
    }, log: any, discover: Explorer): Promise<HubConnection>;
    constructor(hubInfo: {
        uuid: any;
        ip: any;
    }, log: any, discover: Explorer);
    connectAsync(hubInfo: any): Promise<HarmonyClient>;
    disconnectAsync(): Promise<void>;
    /**
     * This function makes sure a harmony client is created, if already there
     * this one is returned otherwise a new connection is made.
     * An error is thrown if the connection could not be established.
     */
    getClient(): Promise<HarmonyClient>;
    handleConnectionOnline(): Promise<void | HarmonyClient>;
    handleConnectionOffline(): Promise<void | HarmonyClient>;
    refresh(): Promise<void | HarmonyClient>;
    refreshAsync(): Promise<HarmonyClient>;
    emitConnectionChanged(): void;
}
