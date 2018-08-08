/// <reference types="node" />
import { EventEmitter } from "events";
import * as net from "net";
export declare class ResponseCollector extends EventEmitter {
    port: number;
    server: net.Server;
    constructor(port: number);
    start(): void;
    stop(): void;
}
