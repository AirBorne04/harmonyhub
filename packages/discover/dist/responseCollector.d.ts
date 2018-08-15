/// <reference types="node" />
import { EventEmitter } from "events";
import * as net from "net";
export declare class ResponseCollector extends EventEmitter {
    port: number;
    server: net.Server;
    /**
     * @param port Port number on this client to use for the tcp server.
     */
    constructor(port: number);
    /**
     * Setup a tcp server to listen for hub messages and emit a
     * response when the message is done.
     */
    start(): void;
    /**
     * Close the tcp server.
     */
    stop(): void;
}
