import * as logger from "debug";
var debug = logger("harmonyhub:discover:explorer");

import { EventEmitter } from "events";
import { Ping } from "./ping";
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
  return Array.from(knownHubs.keys()).map(function (hubUuid: string) {
    return knownHubs.get(hubUuid);
  });
}

export class Explorer extends EventEmitter {

  port: number;
  knownHubs = new Map<string, any>();
  ping: Ping;

  responseCollector: ResponseCollector;
  cleanUpIntervalToken: NodeJS.Timer;

  constructor(port: number, pingOptions) {
    super();

    this.port = port;
    
    debug("Explorer(" + this.port + ")");

    this.ping = new Ping(this.port, pingOptions);

    [
      this.start, this.stop, this.handleResponse,
      this.executeCleanUp
    ].forEach(
      (func) => {
        this[func.name] = func.bind(this);
      }
    );
  }

  start() {
    debug("start()");

    this.responseCollector = new ResponseCollector(this.port);
    this.responseCollector.on("response", this.handleResponse);
    this.cleanUpIntervalToken = setInterval(this.executeCleanUp, 5000);

    this.responseCollector.start();
    this.ping.start();
  }

  stop() {
    debug("stop()");

    this.ping.stop();
    this.responseCollector.stop();
    clearInterval(this.cleanUpIntervalToken);
  }

  handleResponse(data) {
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

  executeCleanUp() {
    debug("executeCleanUp()");

    var now:number = Date.now();

    Array.from(this.knownHubs.keys()).forEach((hubUuid: string) => {
      var hub = this.knownHubs.get(hubUuid);
      var diff = now - hub.lastSeen;

      if (diff > 5000) {
        debug("hub at " + hub.ip + " seen last " + diff + "ms ago. clean up and tell subscribers that we lost that one.");
        this.knownHubs.delete(hubUuid);
        this.emit("offline", hub);
        this.emit("update", arrayOfKnownHubs(this.knownHubs));
      }
    })
  }
}