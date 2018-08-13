import * as logger from "debug";
var debug = logger("harmonyhub:discover:ping");

import * as dgram from "dgram";
import * as os from "os";

export class PingOptions {
  port?: number;
  address?: string | Array<string>;
  interval?: number;
}

function generateBroadcastIp() {

  if (!/^win/i.test(process.platform)) {
    debug("We are running non windows so just broadcast");
    return undefined;
  }

  debug("We are running on windows so we try to find the local ip address to fix a windows broadcast protocol bug");
  var ifaces = os.networkInterfaces(),
      possibleIps = [];

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

export class Ping {

  socket: dgram.Socket;

  message: string;
  messageBuffer: Buffer;
  intervalToken: NodeJS.Timer;

  options: PingOptions;

  constructor(portToAnnounce: number, options?: PingOptions) {

    // try to find an ip address that is in a local (home) network
    options = options || {};
    options.address = options.address || generateBroadcastIp();
    
    if (typeof options.address == "string") {
      options.address = [options.address as string];
    }

    // merge default with user options
    this.options = {
      ...{
        port: 5224,
        address: ["255.255.255.255"],
        interval: 1000
      },
      ...options
    };

    debug(`Ping(${portToAnnounce}, ${JSON.stringify(this.options)})`);

    // init the welcome messages
    this.message = `_logitech-reverse-bonjour._tcp.local.\n${portToAnnounce}`;
    this.messageBuffer = new Buffer(this.message);

    // bind all functions to this
    [
      this.emit, this.start, this.stop, this.isRunning
    ].forEach(
      (func) => {
        this[func.name] = func.bind(this);
      }
    );
  }

  emit() {
    debug("emit()");

    // emit to all the addresses
    (this.options.address as Array<string>).forEach(
      address => this.socket.send(
        this.messageBuffer, 0,
        this.message.length, this.options.port,
        address,
        (err) => {
          if (err) {
            debug("error emitting ping. stopping now :( (" + err + ")");
            this.stop();
          }
        })
    );
  }

  start() {
    debug("start()");

    // setup socket to broadcast messages from any available port
    // unref so that the app can close
    this.socket = dgram.createSocket("udp4");
    this.socket.bind(0, () => {
      // this.options.port,  -> forget this bind no need to care from which port the data was send??
      this.socket.setBroadcast(true);
    });
    this.socket.unref();

    // start the interval, do not unref to keep node js running
    this.intervalToken = setInterval(this.emit, this.options.interval);
  }

  stop() {
    debug("stop()");
    clearInterval(this.intervalToken);
    this.intervalToken = undefined;

    // close the socket
    this.socket.close();
    this.socket = undefined;
  }

  isRunning() {
    debug("isRunning()");
    return (this.intervalToken !== undefined);
  }
}