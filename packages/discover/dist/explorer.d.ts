/// <reference types="node" />
import { EventEmitter } from "events";
import { Ping, PingOptions } from "./ping";
import { ResponseCollector } from "./responseCollector";
export declare class Explorer extends EventEmitter {
    port: number;
    knownHubs: Map<string, any>;
    ping: Ping;
    responseCollector: ResponseCollector;
    cleanUpIntervalToken: NodeJS.Timer;
    /**
     * @param incomingPort The port on the current client to use when pinging.
     * @param pingOptions Defines the broadcasting details for this explorer.
     */
    constructor(incomingPort: number, pingOptions?: PingOptions);
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
