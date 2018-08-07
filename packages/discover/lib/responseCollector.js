var debug = require('debug')('harmonyhubjs:discover:responsecollector');
const { EventEmitter } = require('events');
var net = require('net')

class ResponseCollector extends EventEmitter {
  constructor (port) {
    debug('ResponseCollector(' + port + ')');

    this.port = port;
  }

  start () {
    debug('start()')

    this.server = net.createServer((socket) => {
      debug('handle new connection');

      var buffer = '';

      socket.on('data', (data) => {
        debug('received data chunk');
        buffer += data.toString();
      });

      socket.on('end', () => {
        debug('connection closed. emitting data.');
        self.emit('response', buffer);
      })
    }).listen(self.port);
  }

  stop () {
    debug('stop()');

    if (this.server) {
      this.server.close();
    } else {
      debug('not running');
    }
  }
}

module.exports = ResponseCollector
