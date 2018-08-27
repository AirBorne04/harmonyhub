# harmonyhub
`harmonyhub` is a Node.JS library which wants to consolidate functions around interaction with a Logitech Harmony Hub from various different libraries from the community (the original authors and repos can be found in the Readme of each of the contained packages).
The library contains the following packages:
Package | Status
------------ | -------------
[client](/packages/client) (interacting with the hub) | [![npm](https://img.shields.io/npm/v/%40harmonyhub/client.svg)](https://npmjs.com/%40harmonyhub%2Fclient) [![npm](https://img.shields.io/npm/dw/%40harmonyhub%2Fclient.svg)](https://npmjs.com/%40harmonyhub%2Fclient)
[discover](/packages/discover) (find a hub in your network) | [![npm](https://img.shields.io/npm/v/%40harmonyhub/discover.svg)](https://npmjs.com/%40harmonyhub%2Fdiscover) [![npm](https://img.shields.io/npm/dw/%40harmonyhub%2Fdiscover.svg)](https://npmjs.com/%40harmonyhub%2Fdiscover)

I recommend to use typescript since this helps to use this code without digging to much into the documentation in code :)

## Installation
```bash
npm install @harmonyhub/*
```
Where * is your package name.

## Contribution
The `master` branch contains the latest stable release of the application.
Development efforts are integrated with the `develop` branch first. Changes get then merged into `master` as soon as a new release should be published.

Thank you for your contribution!

## User base
The library is currently used in the [node-red-contrib-harmony](https://github.com/Aietes/node-red-contrib-harmony) by [aietes](https://github.com/Aietes) through which some bugs could be discovered and fixed!

## License

Copyright (c) 2018

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.