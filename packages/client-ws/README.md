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
* added typings to the harmonyhub response data for easing development with typescript
* switch to the harmony service running on websockets (compatible to the xmpp version)
* rewrite to class style
* replacement of Q library with native nodejs Promises (dep reduction) also means that if you switch from harmonyhubjs-client package to mine you need to adjust how you are dealing with your promises (switch to official spec)
* update of dependencies to newer packages (0 security issues by npm audit)
* incorporation of [@patters](https://github.com/patters) bug fix of [MAX_CLIENTS=6 error](https://github.com/swissmanu/harmonyhubjs-client/pull/43)

## Usage

The following examples are available in the example [folder](/examples/client-ws) and are written in modern javascript with async/await utilization.

* [discover-connect](/examples/client-ws/discover-connect.ts) - discover and and connect to hubs on the network
* [toggleTvActivity](/examples/client-ws/toggleTvActivity.ts) - toggles 'Watch TV' activity and off
* [printFunctions](/examples/client-ws/printFunctions.ts) - prints out all available devices and their names together with all commands availbale for a 'Television' device
* [stateDigest](/examples/client-ws/stateDigest.ts) - shows how to listen on stateDigest events from the hub

## Debug Traces
`@harmonyhub/client-ws` uses [debug](https://github.com/visionmedia/debug) for generating traces throughout its execution time. Activate them by setting the `DEBUG` environment variable:

```bash
$ DEBUG=harmonyhub:client-ws* node example.js
```
