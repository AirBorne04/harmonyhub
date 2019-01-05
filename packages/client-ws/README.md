# Client Package

`@harmonyhub/client-ws` is a package of the harmonyhub library for interacting with a Logitech Harmony Hub, this is utilizing websockets due to the dicontinuation of xmpp in firmware version 206.

It is based [@lopelex](https://github.com/lopelex) [harmony-websocket](https://github.com/lopelex/harmony-websocket) implementation following the original xmpp based implementation of [@swissmanu](https://github.com/swissmanu) harmonyhubjs-client
Which was based upon [@jterraces](https://github.com/jterrace) awesome Harmony
[protocol guide](https://github.com/jterrace/pyharmony/blob/master/PROTOCOL.md). `harmonyhubjs-client` provides an
[extended protocol guide](https://github.com/swissmanu/harmonyhubjs-client/tree/master/docs/protocol) for the interested ones.


## Installation
```bash
npm install @harmonyhub/client-ws --save
```

## Enhancements

Enhancements over the harmonyhubjs-client package are the following
* switch to the harmony service running on websockets (compatible to the xmpp version)
* rewrite to class style
* replacement of Q library with native nodejs Promises (dep reduction) also means that if you switch from harmonyhubjs-client package to mine you need to adjust how you are dealing with your promises (switch to official spec)
* update of dependencies to newer packages (0 security issues by npm audit)
* incorporation of [@patters](https://github.com/patters) bug fix of [MAX_CLIENTS=6 error](https://github.com/swissmanu/harmonyhubjs-client/pull/43)

## Usage
```javascript
var harmony = require('@harmonyhub/client-ws').getHarmonyClient;

harmony('192.168.1.200')
  .then(function(harmonyClient) {
    harmonyClient.isOff()
      .then(function(off) {
        if(off) {
          console.log('Currently off. Turning TV on.');

          harmonyClient.getActivities()
            .then(function(activities) {
              activities.some(function(activity) {
                if(activity.label === 'Watch TV') {
                  var id = activity.id
                  harmonyClient.startActivity(id)
                  harmonyClient.end()
                  return true
                }
                return false
              })
            });
        } else {
          console.log('Currently on. Turning TV off');
          harmonyClient.turnOff();
          harmonyClient.end();
        }
      })
  });
```

This example connects to a Harmony hub available on the IP `192.168.1.200`. As soon as the the connection is established, `isOff()` checks if the equipment is turned off. If off, the activity with the name `Watch TV` is started. If on, all devices are turned off.

## Debug Traces
`@harmonyhub/client-ws` uses [debug](https://github.com/visionmedia/debug) for generating traces throughout its execution time. Activate them by setting the `DEBUG` environment variable:

```bash
$ DEBUG=harmonyhub:client-ws* node myharmonyjsapp.js
```
