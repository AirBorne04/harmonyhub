"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const autobind_decorator_1 = require("autobind-decorator");
const logger = require("debug");
var debug = logger("harmonyhub:discover:responsecollector");
const events_1 = require("events");
const net = require("net");
let ResponseCollector = class ResponseCollector extends events_1.EventEmitter {
    /**
     * @param port Port number on this client to use for the tcp server.
     */
    constructor(port) {
        super();
        debug(`Be aware that port ${port} needs to be reachable on your machine in order to discover harmony hubs.`);
        debug(`ResponseCollector(${port})`);
        this.port = port;
    }
    /**
     * Setup a tcp server to listen for hub messages and emit a
     * response when the message is done.
     */
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
    /**
     * Close the tcp server.
     */
    stop() {
        debug("stop()");
        if (this.server) {
            this.server.close();
        }
        else {
            debug("not running");
        }
    }
};
ResponseCollector = __decorate([
    autobind_decorator_1.default
], ResponseCollector);
exports.ResponseCollector = ResponseCollector;
