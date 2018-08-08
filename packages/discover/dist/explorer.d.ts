/// <reference types="node" />
import { EventEmitter } from "events";
import { Ping } from "./ping";
import { ResponseCollector } from "./responseCollector";
export declare class Explorer extends EventEmitter {
    port: number;
    knownHubs: Map<string, any>;
    ping: Ping;
    responseCollector: ResponseCollector;
    cleanUpIntervalToken: NodeJS.Timer;
    constructor(port: number, pingOptions: any);
    start(): void;
    stop(): void;
    handleResponse(data: any): void;
    executeCleanUp(): void;
}
