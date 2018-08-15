export declare class PingOptions {
    port?: number;
    address?: string | Array<string>;
    interval?: number;
}
export declare class Ping {
    private socket;
    private portToAnnounce;
    private message;
    private messageBuffer;
    private intervalToken;
    private options;
    constructor(portToAnnounce: number, options?: PingOptions);
    /**
     * emit a broadcast into the network.
     */
    emit(): void;
    /**
     * Start an interval emitting broadcasts into the network.
     */
    start(): void;
    /**
     * Stop broadcasting into the network.
     */
    stop(): void;
    /**
     * Return an indicator it this ping is currently running.
     */
    isRunning(): boolean;
}
