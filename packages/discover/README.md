# Discover package

`@harmonyhub/discover` is a package which detects available Logitech Harmony hubs in the local network.


## Installation

```bash
npm install @harmonyhub/discover
```

## Usage

```javascript
const HarmonyHubDiscover = require('harmonyhub-discover');
const discover = new HarmonyHubDiscover(61991);

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

// Stop looking for hubs again:
// discover.stop()
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

## License

Copyright (c) 2018

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
