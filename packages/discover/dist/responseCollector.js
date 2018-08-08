"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("debug");
var debug = logger("harmonyhub:discover:responsecollector");
const events_1 = require("events");
const net = require("net");
class ResponseCollector extends events_1.EventEmitter {
    constructor(port) {
        super();
        debug(`Be aware that port ${port} needs to be reachable on your machine in order to discover harmony hubs.`);
        debug(`ResponseCollector(${port})`);
        this.port = port;
    }
    start() {
        debug("start()");
        this.server = net.createServer((socket) => {
            debug("handle new connection");
            var buffer = "";
            socket.on("data", (data) => {
                debug("received data chunk");
                buffer += data.toString();
            });
            socket.on("end", () => {
                debug("connection closed. emitting data.");
                this.emit("response", buffer);
            });
        }).listen(this.port);
    }
    stop() {
        debug("stop()");
        if (this.server) {
            this.server.close();
        }
        else {
            debug("not running");
        }
    }
}
exports.ResponseCollector = ResponseCollector;
