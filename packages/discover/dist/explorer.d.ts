/// <reference types="node" />
import { EventEmitter } from 'events';
import { Ping, PingOptions } from './ping';
import { ResponseCollector } from './responseCollector';
export interface IHubData {
    uuid: string;
    ip: string;
    friendlyName: string;
    fullHubInfo: IFullHubInfo;
    lastSeen: number;
}
export interface IFullHubInfo {
    email: string;
    mode: string;
    accountId: string;
    ip: string;
    port: string;
    uuid: string;
    hubId: string;
    current_fw_version: string;
    productId: string;
    setupSessionType: string;
    setupSessionClient: string;
    setupSessionIsStale: string;
    setupSessionSetupType: string;
    setupStatus: string;
    host_name: string;
    friendlyName: string;
    discoveryServerUri: string;
    discoveryServerUriCF: string;
    openApiVersion: string;
    minimumOpenApiClientVersionRequired: string;
    recommendedOpenApiClientVersion: string;
    protocolVersion: string;
    hubProfiles: string;
    remoteId: string;
    oohEnabled: string;
}
export declare class Explorer extends EventEmitter {
    port: number;
    knownHubs: Map<string, IHubData>;
    ping: Ping;
    responseCollector: ResponseCollector;
    cleanUpIntervalToken: NodeJS.Timer;
    cleanUpTimeout: number;
    /**
     * @param incomingPort The port on the current client to use when pinging.
     * If unspecified using any port available.
     * @param pingOptions Defines the broadcasting details for this explorer.
     * @param cleanUpTimeout The interval that the hub does not respond to be
     * considerd offline, but minimal 2 * ping interval + 2500 ms, default 5000 ms
     */
    constructor(incomingPort?: number, pingOptions?: PingOptions, cleanUpTimeout?: number);
    /**
     * Inits the listening for hub replies, and starts broadcasting.
     */
    start(): void;
    /**
     * Stop the emitting of broadcasts and disassamble all listeners.
     */
    stop(): void;
    /**
     * Handles the response from a hub by deserializing the response
     * and storing the information. Also emits the online and update events.
     * @param data
     */
    handleResponse(data: string): void;
    /**
     * Run a cleanup event all 5 seconds to  make sure unavailable hubs
     * are no longer tracked and discharged. Also emits the offline and update events.
     */
    executeCleanUp(): void;
}
export declare namespace Explorer {
    enum Events {
        ONLINE = "online",
        OFFLINE = "offline",
        UPDATE = "update"
    }
}
