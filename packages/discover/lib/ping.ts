import autobind from 'autobind-decorator';

import * as logger from 'debug';
const debug = logger('harmonyhub:discover:ping');

import * as dgram from 'dgram';
import * as os from 'os';

export class PingOptions {
  port?: number;
  address?: string | Array<string>;
  interval?: number;
}

function generateBroadcastIp(): Array<string> {

  if (!/^win/i.test(process.platform)) {
    debug('We are running non windows so just broadcast');
    return ['255.255.255.255'];
  }

  debug('We are running on windows so we try to find the local ip address to fix a windows broadcast protocol bug');
  const ifaces = os.networkInterfaces(),
        possibleIps = [];

  Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if ('IPv4' !== iface.family || iface.internal !== false) {
        return;
      }

      possibleIps.push(iface.address);
    });
  });

  return possibleIps.filter((ip) => {
    return ip.indexOf('192.') === 0;
  }).map((ip) => {
    const nums = ip.split('.');
    nums[3] = 255;
    debug('Fallback to local ip address -> ' + nums.join('.'));
    return nums.join('.');
  });

}

@autobind
export class Ping {

  private socket: dgram.Socket;
  private portToAnnounce: number;

  private message: string;
  private messageBuffer: Buffer;
  private intervalToken: NodeJS.Timer;

  private options: PingOptions;

  constructor(portToAnnounce: number, options?: PingOptions) {

    // try to find an ip address that is in a local (home) network
    options = options || {};
    options.address = options.address || generateBroadcastIp();

    if (typeof options.address === 'string') {
      options.address = [options.address as string];
    }

    // merge default with user options
    // default address is 255.255.255.255 from generateBroadcastIp()
    this.options = {
      ...{
        port: 5224,
        interval: 2000
      },
      ...options
    };

    debug(`Ping(${portToAnnounce}, ${JSON.stringify(this.options)})`);

    this.portToAnnounce = portToAnnounce;
    // init the welcome messages
    this.message = `_logitech-reverse-bonjour._tcp.local.\n${portToAnnounce}`;
    this.messageBuffer = Buffer.from(this.message);
  }

  /**
   * emit a broadcast into the network.
   */
  emit(): void {
    debug('emit()');

    // emit to all the addresses
    (this.options.address as Array<string>).forEach(
      (address) => this.socket.send(
        this.messageBuffer, 0,
        this.message.length, this.options.port,
        address,
        (err) => {
          if (err) {
            debug(`error emitting ping. stopping now :( (${err})`);
            this.stop();
          }
        })
    );
  }

  /**
   * Start an interval emitting broadcasts into the network.
   */
  start(): void {
    debug('start()');

    if (this.socket) {
      debug('Ping is already running, call stop() first');
      return;
    }
    // setup socket to broadcast messages from the incoming ping
    // unref so that the app can close
    this.socket = dgram.createSocket('udp4');
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
  stop(): void {
    debug('stop()');

    if (this.intervalToken === undefined) {
      debug('ping has already been stopped, call start() first');
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
  isRunning(): boolean {
    debug('isRunning()');
    return (this.intervalToken !== undefined);
  }
}
