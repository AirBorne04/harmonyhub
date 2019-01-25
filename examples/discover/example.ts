import { Explorer, HubData } from '@harmonyhub/discover';

const discover = new Explorer(51000);

console.log(
  Explorer.Events
);

discover.on(Explorer.Events.ONLINE, (hub: HubData) => {
  console.log(hub);
  console.log('discovered ' + hub.ip);
});

discover.on(Explorer.Events.OFFLINE, (hub: HubData) => {
  console.log('lost ' + hub.ip);
});

discover.on(Explorer.Events.UPDATE, (hubs: Array<HubData>) => {
  const knownHubIps = hubs.reduce((prev, hub) => {
    return prev + (prev.length > 0 ? ', ' : '') + hub.ip;
  }, '');
  console.log('known ips: ' + knownHubIps);
});

discover.start();
