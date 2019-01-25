import { Explorer } from "@harmonyhub/discover";

const discover = new Explorer(51000);

discover.on(Explorer.Events.ONLINE, (hub) => {
  console.log(hub);
  console.log(`discovered ${hub.ip}`);
});

discover.on(Explorer.Events.OFFLINE, (hub) => {
  console.log(`lost ${hub.ip}`);
});

discover.on(Explorer.Events.UPDATE, (hubs) => {
  const knownHubIps = hubs.map((hub) => {
    return hub.ip;
  }).join(',');

  console.log(`known ips: ${knownHubIps}`);
});

discover.start();