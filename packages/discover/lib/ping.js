var debug = require('debug')('harmonyhub:discover:ping');
var dgram = require('dgram');

class Ping {

  constructor(portToAnnounce, options) {

    options = options || {};
    debug('Ping(' + portToAnnounce + ', ' + JSON.stringify(options) + ')');

    this.socket = dgram.createSocket('udp4');
    this.port = options.port || 5224;
    this.address = options.address || '255.255.255.255';
    this.interval = options.interval || 1000;
    this.message = '_logitech-reverse-bonjour._tcp.local.\n' + portToAnnounce;
    this.messageBuffer = new Buffer(this.message);

    // Prepare the socket so it can emit broadcasts:
    this.socket.bind(this.port, () => {
      this.setBroadcast(true);
    });

    [
      this.emit, this.start, this.stop, this.isRunning
    ].forEach(
      (func) => {
        this[func.name] = func.bind(this);
      }
    );
  }

  emit () {
    debug('emit()');
      
    this.socket.send(this.messageBuffer, 0, this.message.length, this.port, this.address,
      (err) => {
        if (err) {
          debug('error emitting ping. stopping now :( (' + err + ')');
          this.stop();
        }
      });
  }

  start () {
    debug('start()');
    this.intervalToken = setInterval(this.emit, this.interval);
  }

  stop () {
    debug('stop()');
    clearInterval(this.intervalToken);
    this.intervalToken = undefined;
    this.socket.close();
  }

  isRunning () {
    debug('isRunning()');
    return (this.intervalToken !== undefined);
  }
} 

module.exports = Ping