import * as logger from "debug";
var debug = logger("harmonyhub:discover:ping");

import * as dgram from "dgram";


export class PingOptions {
  port: number;
  address: string;
  interval: number;
}


export class Ping {

  socket: dgram.Socket;

  message: string;
  messageBuffer: Buffer;
  intervalToken: NodeJS.Timer;

  options: PingOptions;

  constructor(portToAnnounce: number, options: PingOptions) {
    // merge default with user options
    this.options = {
      ...{
        port: 5222,
        address: "255.255.255.255",
        interval: 1000
      },
      ...options
    };

    debug(`Ping(${portToAnnounce}, ${JSON.stringify(this.options)})`);

    // setup socket to broadcast messages to the given ports
    this.socket = dgram.createSocket("udp4");
    this.socket.bind(this.options.port, () => {
      this.socket.setBroadcast(true);
    });

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

    this.socket.send(this.messageBuffer, 0, this.message.length, this.options.port, this.options.address,
      (err) => {
        if (err) {
          debug("error emitting ping. stopping now :( (" + err + ")");
          this.stop();
        }
      });
  }

  start() {
    debug("start()");
    this.intervalToken = setInterval(this.emit, this.options.interval);
  }

  stop() {
    debug("stop()");
    clearInterval(this.intervalToken);
    this.intervalToken = undefined;
    this.socket.close();
  }

  isRunning() {
    debug("isRunning()");
    return (this.intervalToken !== undefined);
  }
}