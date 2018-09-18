# Discover package

`@harmonyhub/discover` is a package which detects available Logitech Harmony hubs in the local network.

It is based upon [@swissmanu](https://github.com/swissmanu) harmonyhubjs-discover

## Installation

```bash
npm install @harmonyhub/discover
```

## Enhancements

Enhancements over the harmonyhubjs-discover package are the following
* rewrite to class style
* replacement of Q library with native nodejs Promises (dep reduction)
* update of dependencies to newer packages (0 security issues by npm audit)
* fix of issue of [non closing socket](https://github.com/swissmanu/harmonyhubjs-discover/issues/5)
* fix the issue of [multiple clients](https://github.com/swissmanu/harmonyhubjs-discover/issues/4)

## Usage

```javascript
const Explorer = require('@harmonyhub/discover').Explorer;
const discover = new Explorer(61991);

discover.on('online', function(hub) {
	// Triggered when a new hub was found
	console.log('discovered ' + hub.ip);
});

discover.on('offline', function(hub) {
	// Triggered when a hub disappeared
	console.log('lost ' + hub.ip);
});

discover.on('update', function(hubs) {
	// Combines the online & update events by returning an array with all known
	// hubs for ease of use.
	const knownHubIps = hubs.reduce(function(prev, hub) {
		return prev + (prev.length > 0 ? ', ' : '') + hub.ip;
	}, '');

	console.log('known ips: ' + knownHubIps);
});

// Look for hubs:
discover.start();

// Stop looking for hubs again and close the app:
setTimeout(discover.stop, 5000);
```

### Further Examples

There are further examples available within the [examples/](examples/) directory.

## Control your hub

After looking up your Harmony hub, use [@harmonyhub/client](https://github.com/AirBorne04/harmonyhub/packages/client) to control it.


## Debug Traces

`@harmonyhub/discover` uses [debug](https://github.com/visionmedia/debug) for generating traces throughout its execution time. Activate them by setting the `DEBUG` environment variable:

```bash
DEBUG=harmonyhub:discover:* node myharmonyjsapp.js
```

## Contribution

The `master` branch contains the latest stable release of the application.
Development efforts are integrated with the `develop` branch first. Changes get then merged into `master` as soon as a new release should be published.

Thank you for your contribution!