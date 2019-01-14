# harmonyhub
`harmonyhub` is a Node.JS library which wants to consolidate functions around interaction with a Logitech Harmony Hub from various different libraries from the community (the original authors and repos can be found in the Readme of each of the contained packages). These libraries have in common the usage of typescript and utilize the debug package for easy debugging. Furthermore I am trying to keep dependencies up to date and have as little of them and the same across the different packages for a minimal footprint.
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

## Contribution
The `master` branch contains the latest stable release of the application. Development efforts are integrated with the `develop` branch first. Changes get then merged into `master` as soon as a new release should be published.

Thank you for your contribution!

## User base
* [node-red-contrib-harmony](https://github.com/Aietes/node-red-contrib-harmony) by [aietes](https://github.com/Aietes)
* [homebridge-harmonyhub-plugin](https://github.com/materik/homebridge-harmonyhub-plugin) by [materik](https://github.com/materik)
* [ioBroker.harmony](https://github.com/Pmant/ioBroker.harmony) by [Pmant](https://github.com/Pmant)

I also do accept small donations if you like working with my library [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/AirBorne04)
