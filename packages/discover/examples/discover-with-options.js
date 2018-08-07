// You can pass optional options to harmonyhubjs-discover.
// The values stated below after the description are the default values.

<<<<<<< HEAD
const discover = new (require('../lib/'))(61991, {
=======
const discover = new (require('../'))(61991, {
>>>>>>> added discover package and moved the git ignore into the root
  // Having multiple network interfaces on a system, you may need to specify the broadcast address to the subnet your
  // hub is connected to.
  // Example: Hub is within subnet 192.168.1.0/24, use address "192.168.1.255".
  address: '255.255.255.255',

  // Discovery probe UDP packets are sent to this port:
  port: 5224,

  // Control time delay in milliseconds between sending two discovery probe packets:
  interval: 1000
<<<<<<< HEAD
});

// register handlers as in basic example

discover.start();
=======
})

// register handlers as in basic example

discover.start()
>>>>>>> added discover package and moved the git ignore into the root
