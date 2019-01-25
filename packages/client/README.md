# Client Package (Deprecated in favour of client-ws)

`@harmonyhub/client` is a package of the harmonyhub library for interacting with a Logitech Harmony Hub.

It is based upon [@swissmanu](https://github.com/swissmanu) harmonyhubjs-client
Which was based upon [@jterraces](https://github.com/jterrace) awesome Harmony
[protocol guide](https://github.com/jterrace/pyharmony/blob/master/PROTOCOL.md). `harmonyhubjs-client` provides an
[extended protocol guide](https://github.com/swissmanu/harmonyhubjs-client/tree/master/docs/protocol) for the interested ones.


## Installation
```bash
npm install @harmonyhub/client
```

## Enhancements

Enhancements over the harmonyhubjs-client package are the following
* added typings to the harmonyhub response data for easing development with typescript
* rewrite to class style
* replacement of Q library with native nodejs Promises (dep reduction) also means that if you switch from harmonyhubjs-client package to mine you need to adjust how you are dealing with your promises (switch to official spec)
* update of dependencies to newer packages (0 security issues by npm audit)
* incorporation of [@patters](https://github.com/patters) bug fix of [MAX_CLIENTS=6 error](https://github.com/swissmanu/harmonyhubjs-client/pull/43)

## Usage
```javascript
import { getHarmonyClient } from '@harmonyhub/client';

async function run(): Promise<void> {
  const harmonyClient = await getHarmonyClient('192.168.0.31');

  const encodedAction = `{"command"::"VolumeUp","type"::"IRCommand","deviceId"::"27633596"}`;
  const dt_press = `action=${encodedAction}:status=press`;
  const dt_release = `action=${encodedAction}:status=release`;

  try {
    const commands = await harmonyClient.getAvailableCommands();
    console.log('commands', commands);
    await harmonyClient.send('holdAction', dt_press);
    await harmonyClient.send('holdAction', dt_release);
    
    harmonyClient.end();
  } catch(error) {
    console.error('Error', error.message);
  }
}

run().catch(
  err => console.log(err)
);
```

This example connects to a Harmony hub available on the IP `192.168.1.200`. As soon as the the connection is established, `isOff()` checks if the equipment is turned off. If off, the activity with the name `Watch TV` is started. If on, all devices are turned off.

## Debug Traces
`@harmonyhub/client` uses [debug](https://github.com/visionmedia/debug) for generating traces throughout its execution time. Activate them by setting the `DEBUG` environment variable:

```bash
$ DEBUG=harmonyhub:client* node example.js
```
