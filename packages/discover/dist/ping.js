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
var debug = logger("harmonyhub:discover:ping");
const dgram = require("dgram");
const os = require("os");
class PingOptions {
}
exports.PingOptions = PingOptions;
function generateBroadcastIp() {
    if (!/^win/i.test(process.platform)) {
        debug("We are running non windows so just broadcast");
        return ["255.255.255.255"];
    }
    debug("We are running on windows so we try to find the local ip address to fix a windows broadcast protocol bug");
    var ifaces = os.networkInterfaces(), possibleIps = [];
    Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            if ('IPv4' !== iface.family || iface.internal !== false) {
                return;
            }
            possibleIps.push(iface.address);
        });
    });
    return possibleIps.filter((ip) => {
        return ip.indexOf("192.") == 0;
    }).map((ip) => {
        var nums = ip.split(".");
        nums[3] = 255;
        debug("Fallback to local ip address -> " + nums.join);
        return nums.join(".");
    });
}
let Ping = class Ping {
    constructor(portToAnnounce, options) {
        // try to find an ip address that is in a local (home) network
        options = options || {};
        options.address = options.address || generateBroadcastIp();
        if (typeof options.address == "string") {
            options.address = [options.address];
        }
        // merge default with user options
        // default address is 255.255.255.255 from generateBroadcastIp()
        this.options = Object.assign({
            port: 5224,
            interval: 1000
        }, options);
        debug(`Ping(${portToAnnounce}, ${JSON.stringify(this.options)})`);
        this.portToAnnounce = portToAnnounce;
        // init the welcome messages
        this.message = `_logitech-reverse-bonjour._tcp.local.\n${portToAnnounce}`;
        this.messageBuffer = new Buffer(this.message);
    }
    /**
     * emit a broadcast into the network.
     */
    emit() {
        debug("emit()");
        // emit to all the addresses
        this.options.address.forEach(address => this.socket.send(this.messageBuffer, 0, this.message.length, this.options.port, address, (err) => {
            if (err) {
                debug("error emitting ping. stopping now :( (" + err + ")");
                this.stop();
            }
        }));
    }
    /**
     * Start an interval emitting broadcasts into the network.
     */
    start() {
        debug("start()");
        if (this.socket) {
            debug("Ping is already running, call stop() first");
            return;
        }
        // setup socket to broadcast messages from the incoming ping
        // unref so that the app can close
        this.socket = dgram.createSocket("udp4");
        this.socket.bind(this.portToAnnounce, () => {
            // this.options.port,  -> forget this bind no need to care from which port the data was send??
            this.socket.setBroadcast(true);
        });
        this.socket.unref();
        // start the interval, do not unref to keep node js running
        this.intervalToken = setInterval(this.emit, this.options.interval);
    }
    /**
     * Stop broadcasting into the network.
     */
    stop() {
        debug("stop()");
        if (this.intervalToken == undefined) {
            debug("ping has already been stopped, call start() first");
            return;
        }
        // stop the message emit
        clearInterval(this.intervalToken);
        this.intervalToken = undefined;
        // close the socket
        this.socket.close();
        this.socket = undefined;
    }
    /**
     * Return an indicator it this ping is currently running.
     */
    isRunning() {
        debug("isRunning()");
        return (this.intervalToken !== undefined);
    }
};
Ping = __decorate([
    autobind_decorator_1.default
], Ping);
exports.Ping = Ping;
