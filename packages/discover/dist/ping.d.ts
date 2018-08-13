/// <reference types="node" />
import * as dgram from "dgram";
export declare class PingOptions {
    port?: number;
    address?: string | Array<string>;
    interval?: number;
}
export declare class Ping {
    socket: dgram.Socket;
    message: string;
    messageBuffer: Buffer;
    intervalToken: NodeJS.Timer;
    options: PingOptions;
    constructor(portToAnnounce: number, options?: PingOptions);
    emit(): void;
    start(): void;
    stop(): void;
    isRunning(): boolean;
}
