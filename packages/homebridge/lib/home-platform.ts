import autobind from 'autobind-decorator';
import { EventEmitter } from 'events';

import { Explorer, Explorer as Discover } from '@harmonyhub/discover';
import { AccessoryBase } from './accessory-base';
import { Hub } from './hub';
import { HubConnection as Connection } from './hub-connection';

import { HubData } from '@harmonyhub/discover';
import * as _ from 'lodash';

export const Events = {
  DiscoveredHubs: 'discoveredHubs'
};

let singleton: HomePlatform;

@autobind
export class HomePlatform extends EventEmitter {

  log: any;
  disabled: boolean;

  discoveredHubs: Array<HubData> = [];
  cachedAccessories: Array<any> = [];
  // _hubs = {};
  hubMap = new Map<string, any>();
  // _hubIndex: Array<any> = [];

  isInitialized: boolean = false;
  autoAddNewHubs: boolean = false;

  discover: Explorer;
  api: any;

  constructor(log, config, api) {
    super();

    this.log = log;

    if (singleton) {
      log.warn('Ignoring duplicate Harmony Platform.  ' +
               'Only one platform can be defined.  ' +
               'Multi-Hub support is now built into the platform, so multiple definitions are no longer required.');
      this.disabled = true;
      return;
    }

    singleton = this;

    if (!config) {
      log.warn('Ignoring Harmony Platform setup because it is not configured');
      this.disabled = true;
      return;
    }

    if (config.ip_address) {
      log.warn('Specifying ip_address is no longer supported in the platform, ' +
               'so the specified ip_address will be ignored. ' +
               'The platform is designed for auto discovery of all hubs on the network.');
    }

    this.discover = new Discover(61991, {});

    this.discover.on(Explorer.Events.UPDATE, (hubs: Array<HubData>) => {
      this.log.debug('received update event from @harmonyhub/discover. there are ' + hubs.length + ' hubs');
      this.discoveredHubs = hubs;
      this.discoveredHubs.forEach(this._handleDiscoveredHub);
      this.emit(Events.DiscoveredHubs, hubs);
    });

    this.discover.start();

    if (api) {
      // Save the API object as plugin needs to register new accessory via this object.
      this.api = api;

      // Listen to event "didFinishLaunching", this means homebridge already finished loading cached accessories
      // Platform Plugin should only register new accessory that doesn't exist in homebridge after this event.
      // Or start discover new accessories
      this.api.on('didFinishLaunching', this._finishInitialization);
    }
  }

  _finishInitialization(): Promise<void | any> {
    return this._finishInitializationAsync()
      .catch((err) => {
        this.log.error('Error finishing initialization of HarmonyHub: ' +
                       (err ? (err.stack || err.message || err) : err));
      });
  }

  _finishInitializationAsync(): Promise<boolean> {
    this.log.debug('Finalizing Plugin Launch');

    const accProm: Array<Promise<{}>> = this.cachedAccessories.map((acc) => {
      acc.updateReachability(false);
      const hubId = acc && acc.context && acc.context.hubId;
      if (!hubId) {
        return;
      }
      let hub = this.hubMap.get(hubId);
      if (hub) {
        return;
      }
      hub = new Hub(this.log);
      this.hubMap.set(hubId, hub);
      return this._refreshHubAccessories(hubId, hub, false);
    });

    return Promise.all(accProm)
      .then(() => {
        this.autoAddNewHubs = true;
        return this.discoveredHubs || [];
      })
      .then((hubArr) => Promise.all(hubArr.map(
        this._handleDiscoveredHub
      )))
      .then(() => {
        return (this.isInitialized = true);
      });
  }

  async _handleDiscoveredHub(hubInfo: HubData): Promise<{}> {
    if (!this.autoAddNewHubs) {
      return;
    }

    if (!hubInfo.uuid) { return; }

    let hub = this.hubMap.get(hubInfo.uuid);
    if (hub && hub.connection) {
      return;
    }

    const conn = new Connection(hubInfo, this.log, this.discover);
    if (!hub) {
      hub = new Hub(this.log, conn);
      this.hubMap.set(hubInfo.uuid, hub);
    }
    else {
      hub.updateConnection(conn);
    }

    return conn.connect(hubInfo).then(
      () => this._refreshHubAccessories(hubInfo.uuid, hub, true)
    );
  }

  async _refreshHubAccessories(hubId: string, hub: Hub, doRegister: boolean): Promise<{}> {
    const cachedAccList = this.cachedAccessories.filter((acc) => {
      return acc && acc.context && acc.context.hubId === hubId;
    });

    let accList = await hub.updateAccessories(cachedAccList);
    if (doRegister) {
      if (!this.api) { return; }
      accList = accList.map((acc) => {
        return (acc instanceof AccessoryBase) ? acc.accessory : acc;
      });
      const newAccList = _.difference(accList, cachedAccList);
      this.api.registerPlatformAccessories('homebridge-harmonyhub', 'HarmonyHub', newAccList);
    }

    return accList;
  }

  configureAccessory(accessory) {
    if (singleton && singleton !== this) {
      return singleton.configureAccessory(accessory);
    }
    if (this.disabled) {
      return false;
    }
    this.log.debug('Plugin - Configure Accessory: ' + accessory.displayName);
    if (this.cachedAccessories == null) {
      this.cachedAccessories = [];
    }
    this.cachedAccessories.push(accessory);
  }
}
