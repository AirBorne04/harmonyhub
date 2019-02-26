import autobind from 'autobind-decorator';
import * as logger from 'debug';
import * as got from 'got';

const debug = logger('harmonyhub:client-ws:harmonyclient');

import { EventEmitter } from 'events';

import { w3cwebsocket as WebSocketClient } from 'websocket';
import WebSocketAsPromised = require('websocket-as-promised');

/**
 * Creates a new HarmonyClient using the given xmppClient to communication.
 */
@autobind
export class HarmonyClient extends EventEmitter {

  private wsClient: WebSocketAsPromised;
  private remoteId: string;
  private heartbeatInterval: NodeJS.Timer;

  public async connect(hubip: string, remoteId?: string) {
    debug('connect to harmony hub');
    // use the provided remoteId or get it from the hub
    this.remoteId = remoteId || (await this._getRemoteId(hubip)).body.data.remoteId
      || (await this._getRemoteId(hubip)).body.data.activeRemoteId;
    return this._connect(hubip);
  }

  private async _getRemoteId(hubip: string) {

    const payload = {
      url: 'http://' + hubip + ':8088/',
      method: 'POST',
      timeout: 10000,
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Origin': 'http://sl.dhg.myharmony.com' // this is new in firmware 4.10.250
      },
      json: true,
      body: {
        id: 124,
        cmd: 'setup.account?getProvisionInfo',
        params: {}
      }
    };

    return got(payload);
  }

  private async _connect(hubip: string) {
    const url = `ws://${hubip}:8088/?domain=svcs.myharmony.com&hubId=${this.remoteId}`;

    debug(`connecting to ${url}`);

    this.wsClient = new WebSocketAsPromised(url, {
      createWebSocket: (urlString: string) => new WebSocketClient(urlString),
      packMessage: (data: any) => JSON.stringify(data),
      unpackMessage: (message: string) => JSON.parse(message),
      attachRequestId: (data: any, requestId: string) => {
        data.hbus.id = requestId;
        return data;
      },
      extractRequestId: (data: any) => data && data.id
    });

    this.wsClient.onClose.addListener(() => {
      clearInterval(this.heartbeatInterval);
      this.emit(HarmonyClient.Events.DISCONNECTED);
    });

    this.wsClient.onOpen.addListener(() => {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = setInterval(() => this.wsClient.send(''), 55000)
      this.emit(HarmonyClient.Events.CONNECTED);
    });

    const payload = {
      hubId: this.remoteId,
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

    return this.wsClient.open()
      .then(() => this.wsClient.onUnpackedMessage.addListener(this._onMessage))
      .then(() => this.wsClient.sendPacked(payload));
  }

  _onMessage(message) {
    if (message.type === 'connect.stateDigest?notify') {
      this.onStateDigest(message.data);
    }
  }

  /**
   * The state digest is caused by the hub to let clients know about remote updates
   * @param {message} stateDigest
   */
  private onStateDigest(stateDigest) {
    debug(`received state digest ${JSON.stringify(stateDigest)}`);
    this.emit(HarmonyClient.Events.STATE_DIGEST, stateDigest);
  }

  /**
   * Returns the latest turned on activity from a hub.
   *
   * @returns Promise<string>
   */
  public getCurrentActivity(): Promise<string> {
    debug('retrieve current activity');

    const payload = {
      hubId: this.remoteId,
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

    return this.wsClient.sendRequest(payload)
      .then((response) => {
        return response.data.result;
      });
  }

  /**
   * Retrieves a list with all available activities.
   */
  public async getActivities(): Promise<Array<HarmonyClient.ActivityDescription>> {
    debug('retrieve activities');

    const availableCommands = await this.getAvailableCommands();
    return availableCommands.activity;
  }

  /**
   * Starts an activity with the given id.
   */
  public startActivity(activityId): Promise<{}> {
    const payload = {
      hubId: this.remoteId,
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
          activityId
        }
      }
    };

    return this.wsClient.sendRequest(payload);
  }

  /**
   * Turns the currently running activity off. This is implemented by "starting" an imaginary activity with the id -1.
   */
  public turnOff(): Promise<{}> {
    debug('turn off');
    return this.startActivity('-1');
  }

  /**
   * Checks if the hub has now activity turned on. This is implemented by checking the hubs current activity. If the
   * activities id is equal to -1, no activity is on currently.
   */
  public async isOff(): Promise<boolean> {
    debug('check if turned off');

    const activityId = await this.getCurrentActivity(),
          off = (activityId === '-1');

    debug(off ? 'system is currently off' : 'system is currently on with activity ' + activityId);
    return off;
  }

  /**
   * Acquires all available commands from the hub when resolving the returned promise.
   */
  public getAvailableCommands(): Promise<HarmonyClient.ConfigDescription> {
    debug('retrieve available commands');

    const payload = {
      hubId: this.remoteId,
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

    return this.wsClient.sendRequest(payload)
      .then((resp: any) => {
        return resp.data as HarmonyClient.ConfigDescription;
      });
  }

  /**
   * sends a command to the hub, including the press action and the release after the command_timeframe
   * @param action action name usually 'holdAction'
   * @param body
   * @param commandTimeframe the time when to send a release message
   */
  public async send(action: string, body: string | {command: string, deviceId: string, type?: string},
                    commandTimeframe = 0): Promise<{}> {
    let encodedAction;
    if (typeof body === 'string') {
      encodedAction = body;
    }
    else if (body && body.command && body.deviceId) {
      debug(`Sending command ${body.command} to device ${body.deviceId} with delay`);
      encodedAction =
        `{"command": "${body.command}", "type": "${body.deviceId || 'IRCommand'}", "deviceId": "${body.deviceId}"}`;
    }
    else {
      return Promise.reject(
        'With the send command you need to provide a body parameter which ' +
        'can be a string or {command: string, deviceId: string, type?: string}'
      );
    }

    const payloadPress = {
      hubId: this.remoteId,
      timeout: 30,
      hbus: {
        cmd: `harmony.engine?${action}`,
        id: 0,
        params: {
          async: 'true',
          timestamp: 0,
          status: 'press',
          verb: 'render',
          action: encodedAction
        }
      }
    }, payloadRelease = {
      ...payloadPress,
      hbus: {
        ...payloadPress.hbus,
        params: {
          ...payloadPress.hbus.params,
          timestamp: commandTimeframe,
          status: 'release'
        }
      }
    };

    this.wsClient.sendPacked(payloadPress);

    return new Promise((resolve, reject) => {
      if (commandTimeframe > 0) {
        setTimeout(
          () => {
            this.wsClient.sendPacked(payloadRelease);
            resolve();
          }, commandTimeframe);
      }
      else {
        this.wsClient.sendPacked(payloadRelease);
        resolve();
      }
    });
  }

  /**
   * Closes the connection the the hub. You have to create a new client if you would like
   * to communicate again with the hub.
   */
  public end() {
    debug('close harmony client');
    this.wsClient.close();
  }
}

export namespace HarmonyClient {
  export enum Events {
    STATE_DIGEST = 'stateDigest',
    CONNECTED = 'open',
    DISCONNECTED = 'close'
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
    fixit: any;
    zones?: any;
    suggestedDisplay: string;
    isAVActivity: boolean;
    sequences: Array<any>;
    controlGroup: Array<ControlGroup>;
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
    powerFeatures: PowerFeatures;
    Capabilities: Array<number>;
    controlGroup: Array<ControlGroup>;
    DongleRFID: number;
    IsKeyboardAssociated: boolean;
    model: string;
    type: string;
    id: string;
    Transport: number;
    isManualPower: boolean;
  }

  export class PowerFeatures {
    PowerOffActions: PowerAction;
    PowerOnActions: PowerAction;
  }

  export class PowerAction {
    // tslint:disable-next-line:variable-name
    __type: string;
    IRCommandName: string;
    Order: number;
    Duration: any;
    ActionId: number;
  }

  export class ControlGroup {
    name: string;
    function: Array<FunctionObj>;
  }

  export class FunctionObj {
    action: string;
    name: string;
    label: string;
  }

  export class StateDigest {
    activityId: string;
    activityStatus: StateDigestStatus;

    sleepTimerId: number;
    runningZoneList: Array<{}>;
    contentVersion: number;
    errorCode: ERROR_CODE;
    syncStatus: number;
    time: number;
    stateVersion: number;
    tzoffset: string;
    tzOffset: string;
    mode: number;
    hubSwVersion: string;
    deviceSetupState: Array<{}>;
    isSetupComplete: boolean;
    configVersion: number;
    sequence: boolean;
    discoveryServer: string;
    discoveryServerCF: string;
    updates: any;
    wifiStatus: number;
    tz: string;
    activitySetupState: boolean;
    runningActivityList: string;
    hubUpdate: boolean;
    accountId: string;
  }

  export enum StateDigestStatus {
    HUB_IS_OFF = 0,
    ACTIVITY_STARTING = 1,
    ACTIVITY_STARTED = 2,
    HUB_TURNING_OFF = 3
  }

  export enum ERROR_CODE {
    OK = '200'
  }
}

export default HarmonyClient;
