import autobind from "autobind-decorator";
import * as logger from "debug";

var debug = logger("harmonyhub:client-ws:harmonyclient");

// import { default as xmppUtil } from "./util";
import { EventEmitter } from "events";

import { w3cwebsocket as WebSocketClient } from "websocket";
import * as WebSocketAsPromised from "websocket-as-promised/dist";
import * as got from "got";

/**
 * Creates a new HarmonyClient using the given xmppClient to communication.
 */
@autobind
export class HarmonyClient extends EventEmitter {

  private _wsClient: any;
  private _remoteId: string;
  private _interval: NodeJS.Timer;

  public connect(hubip: string) {
    debug("connect to harmony hub");

    return this._getRemoteId(hubip)
      .then(response => {
        this._remoteId = response.body.data.remoteId;
      })
      .then(() => this._connect(hubip))
  }

  private _getRemoteId(hubip: string) {

    const payload = {
      url: 'http://' + hubip + ':8088',
      method: 'POST',
      timeout: 5000,
      headers: {
        'Content-type': 'application/json',
        Accept: 'text/plain',
        Origin: 'http//:localhost.nebula.myharmony.com'
      },
      json: true,
      body: {
        id: 0,
        cmd: 'connect.discoveryinfo?get',
        params: {}
      }
    };

    return got(payload);
  }

  private async _connect(hubip: string) {
    const url = 'ws://' + hubip + ':8088/?domain=svcs.myharmony.com&hubId=' + this._remoteId;

    debug("connecting to " + url);

    this._wsClient = new WebSocketAsPromised(url, {
      createWebSocket: (url: string) => new WebSocketClient(url),
      packMessage: (data: any) => JSON.stringify(data),
      unpackMessage: (message: string) => JSON.parse(message),
      attachRequestId: (data: any, requestId: string) => {
        data.hbus.id = requestId;
        return data;
      },
      extractRequestId: (data: any) => data && data.id
    });

    this._wsClient.onClose.addListener(() => {
      clearInterval(this._interval);
      this.emit('close');
    });

    const payload = {
      hubId: this._remoteId,
      timeout: 30,
      hbus: {
        cmd: 'vnd.logitech.connect/vnd.logitech.statedigest?get',
        id: 0,
        params: {
          verb: 'get',
          format: 'json'
        }
      }
    };

    return this._wsClient.open()
      .then(() => this._interval = setInterval(() => this._wsClient.send(''), 55000))
      .then(() => this._wsClient.onUnpackedMessage.addListener(this._onMessage))
      .then(() => this._wsClient.sendPacked(payload))
      .then(() => this.emit('open'));
  }

  _onMessage(message) {
    if (message.type === 'connect.stateDigest?notify') {
      this.onStateDigest(message);
    }
  }

  /**
   * The state digest is caused by the hub to let clients know about remote updates
   * @param {message} stateDigest 
   */
  onStateDigest(stateDigest) {
    debug("received state digest ", JSON.stringify(stateDigest) );
    this.emit(HarmonyClient.Events.STATE_DIGEST, stateDigest);
  }

  /**
   * Returns the latest turned on activity from a hub.
   *
   * @returns Promise<string>
   */
  public getCurrentActivity(): Promise<string> {
    debug("retrieve current activity");
    
    const payload = {
      hubId: this._remoteId,
      timeout: 30,
      hbus: {
        cmd: 'vnd.logitech.harmony/vnd.logitech.harmony.engine?getCurrentActivity',
        id: 0,
        params: {
          verb: 'get',
          format: 'json'
        }
      }
    };
  
    return this._wsClient.sendRequest(payload)
      .then(response => {
        return response.data.result;
      });
  }

  /**
   * Retrieves a list with all available activities.
   */
  getActivities(): Promise<HarmonyClient.ActivityDescription[]> {
    debug("retrieve activities")

    return this.getAvailableCommands()
      .then(function (availableCommands: HarmonyClient.ConfigDescription) {
        return availableCommands.activity;
      });
  }

  /**
   * Starts an activity with the given id.
   */
  public startActivity(activityId): Promise<{}> {
    const payload = {
      hubId: this._remoteId,
      timeout: 30,
      hbus: {
        cmd: 'harmony.activityengine?runactivity',
        id: 0,
        params: {
          async: 'true',
          timestamp: 0,
          args: {
            rule: 'start'
          },
          activityId: activityId
        }
      }
    };

    return this._wsClient.sendRequest(payload)
               .then(response => response);
  }

  /**
   * Turns the currently running activity off. This is implemented by "starting" an imaginary activity with the id -1.
   */
  public turnOff(): Promise<{}> {
    debug("turn off");
    return this.startActivity("-1");
  }

  /**
   * Checks if the hub has now activity turned on. This is implemented by checking the hubs current activity. If the
   * activities id is equal to -1, no activity is on currently.
   */
  public isOff(): Promise<boolean> {
    debug("check if turned off");

    return this.getCurrentActivity()
      .then(function (activityId) {
        const off = (activityId === "-1");
        debug(off ? "system is currently off" : "system is currently on with activity " + activityId);

        return off;
      });
  }

  /**
   * Acquires all available commands from the hub when resolving the returned promise.
   */
  public getAvailableCommands(): Promise<HarmonyClient.ConfigDescription> {
    debug("retrieve available commands");

    const payload = {
      hubId: this._remoteId,
      timeout: 30,
      hbus: {
        cmd: 'vnd.logitech.harmony/vnd.logitech.harmony.engine?config',
        id: 0,
        params: {
          verb: 'get',
          format: 'json'
        }
      }
    };

    return this._wsClient.sendRequest(payload)
      .then((response: HarmonyClient.ConfigDescription) => {
        return response;
      });
  }

  /**
   * Closes the connection the the hub. You have to create a new client if you would like
   * to communicate again with the hub.
   */
  public end() {
    debug("close harmony client");
    this._wsClient.close();
  }
}

export namespace HarmonyClient {
  export enum Events {
    STATE_DIGEST = "stateDigest"
  }

  export class ConfigDescription {
    activity: Array<ActivityDescription>;
    device: Array<DeviceDescription>;
  }

  export class ActivityDescription {
    id: string;
    type: string;
    label: string;
    isTuningDefault?: boolean;
    activityTypeDisplayName: string;
    rules: Array<any>;
    activityOrder?: number;
    KeyboardTextEntryActivityRole?: string;
    ChannelChangingActivityRole?: string;
    VolumeActivityRole?: string;
    enterActions: Array<any>;
    fixit: Array<any>;
    zones?: any;
    suggestedDisplay: string;
    isAVActivity: boolean;
    sequences: Array<any>;
    controlGroup: Array<any>;
    roles: Array<any>;
    isMultiZone?: boolean;
    icon: string;
    baseImageUri?: string;
    imageKey?: string;
  }

  export class DeviceDescription {
    label: string;
    deviceAddedDate: string;
    ControlPort: number;
    contentProfileKey: number;
    deviceProfileUri: string;
    manufacturer: string;
    icon: string;
    suggestedDisplay: string;
    deviceTypeDisplayName: string;
    powerFeatures: Array<any>;
    Capabilities: Array<any>;
    controlGroup: Array<any>;
    DongleRFID: number;
    IsKeyboardAssociated: boolean;
    model: string;
    type: string;
    id: string;
    Transport: number;
    isManualPower: boolean;
  }
}

export default HarmonyClient;