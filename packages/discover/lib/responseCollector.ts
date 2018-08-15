import autobind from "autobind-decorator";

import * as logger from "debug";
var debug = logger("harmonyhub:discover:responsecollector");

import { EventEmitter } from "events";
import * as net from "net";


@autobind
export class ResponseCollector extends EventEmitter {

  port: number;
  server: net.Server;

  /**
   * @param port Port number on this client to use for the tcp server.
   */
  constructor(port: number) {
    super();

    debug(`Be aware that port ${port} needs to be reachable on your machine in order to discover harmony hubs.`);
    debug(`ResponseCollector(${port})`);

    this.port = port;
  }

  /**
   * Setup a tcp server to listen for hub messages and emit a
   * response when the message is done.
   */
  start(): void {
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
      })
    }).listen(this.port);
  }

  /**
   * Close the tcp server.
   */
  stop() {
    debug("stop()");

    if (this.server) {
      this.server.close();
    } else {
      debug("not running");
    }
  }
}