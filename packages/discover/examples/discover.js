<<<<<<< HEAD
const discover = new (require('../lib/'))(5222);

discover.on('online', function (hub) {
  console.log('discovered ' + hub.ip);
});

discover.on('offline', function (hub) {
  console.log('lost ' + hub.ip);
});
=======
const discover = new (require('../'))(5222);

discover.on('online', function (hub) {
  console.log('discovered ' + hub.ip);
})

discover.on('offline', function (hub) {
  console.log('lost ' + hub.ip);
})
>>>>>>> added discover package and moved the git ignore into the root

discover.on('update', function (hubs) {
  const knownHubIps = hubs.reduce(function (prev, hub) {
    return prev + (prev.length > 0 ? ', ' : '') + hub.ip;
  }, '');

  console.log('known ips: ' + knownHubIps);
<<<<<<< HEAD
});
=======
})
>>>>>>> added discover package and moved the git ignore into the root

discover.start();