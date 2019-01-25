/// <reference types="node" />
import { HarmonyClient } from '@harmonyhub/client-ws';
import { Explorer, HubData } from '@harmonyhub/discover';
import { EventEmitter } from 'events';
export declare const HubConnectionEvents: {
    CONNECTION_CHANGED: string;
    STATE_DIGEST: string;
};
export declare enum HubConnectionStatus {
    UNKNOWN = 0,
    CONNECTING = 1,
    CONNECTED = 2,
    DISCONNECTED = 3
}
export declare class HubConnection extends EventEmitter {
    log: any;
    hubInfo: HubData;
    discover: Explorer;
    client: HarmonyClient;
    clientPromise: Promise<HarmonyClient>;
    status: HubConnectionStatus;
    static createAsync(hubInfo: HubData, log: any, discover: Explorer): Promise<HubConnection>;
    constructor(hubInfo: HubData, log: any, discover: Explorer);
    connect(hubInfo: HubData): Promise<HarmonyClient>;
    disconnect(): Promise<void>;
    /**
     * This function makes sure a harmony client is created, if already there
     * this one is returned otherwise a new connection is made.
     * An error is thrown if the connection could not be established.
     */
    getClient(): Promise<HarmonyClient>;
    makeClient(): Promise<HarmonyClient>;
    handleHubOnline(): Promise<void>;
    handleHubOffline(): Promise<void>;
    handleHubDisconnected(): Promise<void>;
    emitConnectionChanged(status: HubConnectionStatus): void;
}
