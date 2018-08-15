import autobind from "autobind-decorator";
import * as logger from "debug";
var debug = logger("harmonyhub:discover:explorer");

import { EventEmitter } from "events";
import { Ping, PingOptions } from "./ping";
import { ResponseCollector } from "./responseCollector";

function deserializeResponse(response: string): Object {
  var pairs = {};

  response.split(";")
    .forEach((rawPair) => {
      var splitted = rawPair.split(":")
      pairs[splitted[0]] = splitted[1]
    });

  return pairs;
}

function arrayOfKnownHubs(knownHubs: Map<string, any>): Array<any> {
  return Array.from(knownHubs.values());
}

@autobind
export class Explorer extends EventEmitter {

  port: number;
  knownHubs = new Map<string, any>();
  ping: Ping;

  responseCollector: ResponseCollector;
  cleanUpIntervalToken: NodeJS.Timer;

  /**
   * @param incomingPort The port on the current client to use when pinging.
   * @param pingOptions Defines the broadcasting details for this explorer.
   */
  constructor(incomingPort: number, pingOptions?: PingOptions) {
    super();

    this.port = incomingPort;
    
    debug("Explorer(" + this.port + ")");

    this.ping = new Ping(this.port, pingOptions);
  }

  /**
   * Inits the listening for hub replies, and starts broadcasting. 
   */
  start() {
    debug("start()");

    this.responseCollector = new ResponseCollector(this.port);
    this.responseCollector.on("response", this.handleResponse);
    this.cleanUpIntervalToken = setInterval(this.executeCleanUp, 5000);

    this.responseCollector.start();
    this.ping.start();
  }

  /**
   * Stop the emitting of broadcasts and disassamble all listeners.
   */
  stop() {
    debug("stop()");

    this.ping.stop();
    this.responseCollector.stop();
    clearInterval(this.cleanUpIntervalToken);
  }

  /**
   * Handles the response from a hub by deserializing the response
   * and storing the information. Also emits the online and update events.
   * @param data 
   */
  handleResponse(data: string) {
    var hub:any = deserializeResponse(data);

    if (this.knownHubs.get(hub.uuid) === undefined) {
      debug("discovered new hub " + hub.friendlyName);
      this.knownHubs.set(hub.uuid, hub);
      this.emit("online", hub);
      this.emit("update", arrayOfKnownHubs(this.knownHubs));
    } else {
      this.knownHubs.get(hub.uuid).lastSeen = Date.now();
    }
  }

  /**
   * Run a cleanup event all 5 seconds to  make sure unavailable hubs
   * are no longer tracked and discharged. Also emits the offline and update events.
   */
  executeCleanUp() {
    debug("executeCleanUp()");

    var now:number = Date.now();

    Array.from(this.knownHubs.values()).forEach((hub: any) => {
      // var hub = this.knownHubs.get(hubUuid);
      var diff = now - hub.lastSeen;

      if (diff > 5000) {
        debug("hub at " + hub.ip + " seen last " + diff + "ms ago. clean up and tell subscribers that we lost that one.");
        this.knownHubs.delete(hub.uuid);
        this.emit("offline", hub);
        this.emit("update", arrayOfKnownHubs(this.knownHubs));
      }
    })
  }
}