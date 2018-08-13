const Explorer = require('../lib/');
const discover = new Explorer(5222);

discover.on('online', function (hub) {
  console.log('discovered ' + hub.ip);
});

discover.on('offline', function (hub) {
  console.log('lost ' + hub.ip);
});

discover.on('update', function (hubs) {
  const knownHubIps = hubs.reduce(function (prev, hub) {
    return prev + (prev.length > 0 ? ', ' : '') + hub.ip;
  }, '');

  console.log('known ips: ' + knownHubIps);
});

discover.start();