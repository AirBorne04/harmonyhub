var debug = require('debug')('harmonyhub:discover:explorer');
var util = require('util');
const { EventEmitter } = require('events');
var Ping = require('./ping');
var ResponseCollector = require('./responseCollector');

function deserializeResponse(response) {
  var pairs = {};

  response.split(';')
    .forEach(function (rawPair) {
      var splitted = rawPair.split(':')
      pairs[splitted[0]] = splitted[1]
    });

  return pairs;
}

function arrayOfKnownHubs(knownHubs) {
  return Object.keys(knownHubs).map(function (hubUuid) {
    return knownHubs[hubUuid];
  });
}

class Explorer extends EventEmitter {
  constructor(port, pingOptions) {
    this.port = port || 5222;

    debug('Explorer(' + this.port + ')');

    this.knownHubs = {};
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
    debug('start()');

    this.responseCollector = new ResponseCollector(this.port);
    this.responseCollector.on('response', handleResponse);
    this.cleanUpIntervalToken = setInterval(executeCleanUp.bind(this), 5000);

    this.responseCollector.start();
    this.ping.start();
  }

  stop() {
    debug('stop()');

    this.ping.stop();
    this.responseCollector.stop();
    clearInterval(this.cleanUpIntervalToken);
  }

  handleResponse(data) {
    var hub = deserializeResponse(data);

    if (this.knownHubs[hub.uuid] === undefined) {
      debug('discovered new hub ' + hub.friendlyName);
      this.knownHubs[hub.uuid] = hub;
      this.emit('online', hub);
      this.emit('update', arrayOfKnownHubs(this.knownHubs));
    } else {
      this.knownHubs[hub.uuid].lastSeen = new Date();
    }
  }

  executeCleanUp() {
    debug('executeCleanUp()');

    var now = new Date();

    Object.keys(this.knownHubs).forEach(function (hubUuid) {
      var hub = this.knownHubs[hubUuid];
      var diff = now - hub.lastSeen;

      if (diff > 5000) {
        debug('hub at ' + hub.ip + ' seen last ' + diff + 'ms ago. clean up and tell subscribers that we lost that one.');
        delete this.knownHubs[hubUuid];
        this.emit('offline', hub);
        this.emit('update', arrayOfKnownHubs(this.knownHubs));
      }
    })
  }
}

module.exports = Explorer;