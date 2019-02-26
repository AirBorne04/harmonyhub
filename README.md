# harmonyhub
`harmonyhub` is a Node.JS library which wants to consolidate functions around interaction with a Logitech Harmony Hub from various different libraries from the community (the original authors and repos can be found in the Readme of each of the contained packages). These libraries have in common the usage of typescript with tslint and utilize the debug package for easy debugging. Furthermore I am trying to keep dependencies up to date and have as little of them and the same across the different packages for a minimal footprint.
The library contains the following packages:

Package | Status
------------ | -------------
[discover](/packages/discover) (find a hub in your network) | [![npm](https://img.shields.io/npm/v/%40harmonyhub/discover.svg)](https://npmjs.com/%40harmonyhub%2Fdiscover) [![npm](https://img.shields.io/npm/dw/%40harmonyhub%2Fdiscover.svg)](https://npmjs.com/%40harmonyhub%2Fdiscover)
[client-ws](/packages/client-ws) (interacting with the hub via websockets) | [![npm](https://img.shields.io/npm/v/%40harmonyhub/client-ws.svg)](https://npmjs.com/%40harmonyhub%2Fclient-ws) [![npm](https://img.shields.io/npm/dw/%40harmonyhub%2Fclient-ws.svg)](https://npmjs.com/%40harmonyhub%2Fclient-ws)
[client](/packages/client) (interacting with the hub via xmpp) | [![npm](https://img.shields.io/npm/v/%40harmonyhub/client.svg)](https://npmjs.com/%40harmonyhub%2Fclient) [![npm](https://img.shields.io/npm/dw/%40harmonyhub%2Fclient.svg)](https://npmjs.com/%40harmonyhub%2Fclient)

The client and client-ws library are ment to be interexchangable with a compatible api, at the moment the client-ws package is the one to go with but according to Logitech in the future xmpp is the one that should be used.
I recommend to use typescript since this helps to use this code without digging to much into the documentation in code :)

## Installation
```bash
npm install @harmonyhub/discover

npm install @harmonyhub/client

npm install @harmonyhub/client-ws
```

## Why are there two client libraries - which one to use?
There are two client libraries because the harmonyhub provides two protocols which are supporting the same functionality. If you are not sure which library to go with here is a list of pro and cons for each protocol, don't be afraid to choose a wrong one, as the apis of both libs are compatible you can easily switch them forth and back.

websocket protocol | xmpp protocol
------------ | -------------
\- non-official api used by the harmony app | \+ official api
\+ enabled for every user | \- needs to be enabled through the harmony companion app


## Coding guidance
If you are looking to use this library for your project I would suggest the following order of exploring examples, please be aware that most examples are in typescript some of them are also available in pure javascript, if you do have problems with converting the typescript examples into javascript syntax feel free to contact me.

* [discover](/examples/discover/example.ts), to find a hub in your network
* [discover and connect](/examples/client-ws/discover-connect.ts), if you wanna roll with the `client-ws` websocket lib there is a nice option to combine the data from discover with the connect, which saves one data request
* [printFunctions-websocket](/examples/client-ws/printFunctions.ts) and [printFunctions-xmpp](/examples/client/printFunctions.ts), list activities and available functions for the `Television` device, the examples are supposed to be 100% the same, but use the `websocket` and `xmpp` protocol respectively

## Contribution
The `master` branch contains the latest stable release of the application. Development efforts are integrated with the `develop` branch first. Changes get then merged into `master` as soon as a new release should be published.

Thank you for your contribution!

## User base
* [node-red-contrib-harmony](https://github.com/Aietes/node-red-contrib-harmony) by [aietes](https://github.com/Aietes)
* [homebridge-harmonyhub-plugin](https://github.com/materik/homebridge-harmonyhub-plugin) by [materik](https://github.com/materik)
* [ioBroker.harmony](https://github.com/Pmant/ioBroker.harmony) by [Pmant](https://github.com/Pmant)

I also do accept small donations if you like working with my library [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/AirBorne04)
