import { Explorer, HubData } from "../../packages/discover/dist";

const discover = new Explorer(51000);

console.log(
  Explorer.Events
);

discover.on(Explorer.Events.ONLINE, function (hub: HubData) {
  console.log(hub);
  console.log('discovered ' + hub.ip);
});

discover.on(Explorer.Events.OFFLINE, function (hub: HubData) {
  console.log('lost ' + hub.ip);
});

discover.on(Explorer.Events.UPDATE, function (hubs: Array<HubData>) {
  const knownHubIps = hubs.reduce(function (prev, hub) {
    return prev + (prev.length > 0 ? ', ' : '') + hub.ip;
  }, '');

  console.log('known ips: ' + knownHubIps);
});

discover.start();