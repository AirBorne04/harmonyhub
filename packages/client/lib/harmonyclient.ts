import autobind from "autobind-decorator";
import * as logger from "debug";

var debug = logger("harmonyhub:client:harmonyclient");

import { default as xmppUtil } from "./util";
import { EventEmitter } from "events";

/**
 * Creates a new HarmonyClient using the given xmppClient to communication.
 * @param xmppClient
 */
@autobind
export class HarmonyClient extends EventEmitter {

  private _xmppClient: any;
  private _responseHandlerQueue: Array<any>;
  
  constructor(xmppClient) {
    super();

    debug("create new harmony client");

    this._xmppClient = xmppClient;
    this._responseHandlerQueue = [];

    xmppClient.on("stanza", this.handleStanza);
    xmppClient.on("error", function (error) {
      debug("XMPP Error: " + error.message);
    });
  }

  private handleStanza(stanza) {
    debug("handleStanza(" + stanza.toString() + ")");

    // Check for state digest:
    var event = stanza.getChild("event");
    if (event && event.attr("type") === "connect.stateDigest?notify") {
      this.onStateDigest(JSON.parse(event.getText()));
    }

    // Check for queued response handlers:
    this._responseHandlerQueue.forEach(function (responseHandler, index, array) {
      if (responseHandler.canHandleStanza(stanza)) {
        debug("received response stanza for queued response handler");

        var response = stanza.getChildText("oa"),
            oa = stanza.getChild("oa"),
            decodedResponse;

        if (oa && oa.attrs && oa.attrs.errorcode && oa.attrs.errorcode != 200) {
          responseHandler.rejectCallback({
            code: oa.attrs.errorcode,
            message: oa.attrs.errorstring
          });
        }
        else {
          if (responseHandler.responseType === "json") {
            decodedResponse = JSON.parse(response);
          } else {
            decodedResponse = xmppUtil.decodeColonSeparatedResponse(response);
          }
          responseHandler.resolveCallback(decodedResponse);
        }

        array.splice(index, 1);
      }
    });
  }

  /**
   * The state digest is caused by the hub to let clients know about remote updates
   * @param {message} stateDigest 
   */
  onStateDigest(stateDigest) {
    debug("received state digest");
    this.emit(HarmonyClient.Events.STATE_DIGEST, stateDigest);
  }

  /**
   * Returns the latest turned on activity from a hub.
   *
   * @returns Promise<string>
   */
  getCurrentActivity(): Promise<string> {
    debug("retrieve current activity");

    return this.request("getCurrentActivity")
      .then(function (response: any) {
        return response.result;
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
  startActivity(activityId): Promise<{}> {
    var timestamp = new Date().getTime();
    var body = "activityId=" + activityId + ":timestamp=" + timestamp;

    return this.request("startactivity", body, "encoded", (stanza) => {
      // This canHandleStanzaFn waits for a stanza that confirms starting the activity.
      var event = stanza.getChild("event"),
          canHandleStanza = false;

      if (event && event.attr("type") === "connect.stateDigest?notify") {
        var digest = JSON.parse(event.getText());
        if (activityId === "-1" && digest.activityId === activityId && digest.activityStatus === 0) {
          canHandleStanza = true;
        } else if (activityId !== "-1" && digest.activityId === activityId && digest.activityStatus === 2) {
          canHandleStanza = true;
        }
      }
      return canHandleStanza;
    });
  }

  /**
   * Turns the currently running activity off. This is implemented by "starting" an imaginary activity with the id -1.
   */
  turnOff(): Promise<{}> {
    debug("turn off");
    return this.startActivity("-1");
  }

  /**
   * Checks if the hub has now activity turned on. This is implemented by checking the hubs current activity. If the
   * activities id is equal to -1, no activity is on currently.
   */
  isOff(): Promise<boolean> {
    debug("check if turned off");

    return this.getCurrentActivity()
      .then(function (activityId) {
        var off = (activityId === "-1");
        debug(off ? "system is currently off" : "system is currently on with activity " + activityId);

        return off;
      });
  }

  /**
   * Acquires all available commands from the hub when resolving the returned promise.
   */
  getAvailableCommands(): Promise<HarmonyClient.ConfigDescription> {
    debug("retrieve available commands");

    return this.request("config", undefined, "json")
      .then((response:HarmonyClient.ConfigDescription) => {
        return response;
      });
  }

  /**
   * Builds an IQ stanza containing a specific command with given body, ready to send to the hub.
   *
   * @param command
   * @param body
   * @returns {Stanza}
   */
  private buildCommandIqStanza(command: string, body: string) {
    debug("buildCommandIqStanza for command '" + command + "' with body " + body);

    return xmppUtil.buildIqStanza(
      "get"
      , "connect.logitech.com"
      , "vnd.logitech.harmony/vnd.logitech.harmony.engine?" + command
      , body
    );
  }

  private defaultCanHandleStanzaPredicate(awaitedId: string, stanza) {
    var stanzaId = stanza.attr("id");
    return (stanzaId && stanzaId.toString() === awaitedId.toString());
  }

  /**
   * Sends a command with the given body to the hub. The returned promise gets resolved as soon as a response for this
   * very request arrives.
   *
   * By specifying expectedResponseType with either "json" or "encoded", you advice the response stanza handler how you
   * expect the responses data encoding. See the protocol guide for further information.
   *
   * The canHandleStanzaFn parameter allows to define a predicate to determine if an incoming stanza is the response to
   * your request. This can be handy if a generic stateDigest message might be the acknowledgment to your initial
   * request.
   * *
   * @param command
   * @param body
   * @param expectedResponseType
   * @param canHandleStanzaPredicate
   */
  private request(command: string, body?: string, expectedResponseType?: string, canHandleStanzaPredicate?: (string) => boolean): Promise<{}> {
    debug("request with command '" + command + "' with body " + body);
    
    var resolveCallback, rejectCallback, prom = new Promise((resolve, reject) => {
      const iq = this.buildCommandIqStanza(command, body),
            id: string = iq.attr("id");

      expectedResponseType = expectedResponseType || "encoded";
      canHandleStanzaPredicate = canHandleStanzaPredicate || (stanza => this.defaultCanHandleStanzaPredicate(id, stanza));

      resolveCallback = resolve;
      rejectCallback = reject;
      
      // setImmediate
      this._xmppClient.send(iq);
    });

    this._responseHandlerQueue.push({
      canHandleStanza: canHandleStanzaPredicate,
      resolveCallback,
      rejectCallback,
      responseType: expectedResponseType
    });

    return prom;
  }

  /**
   * Sends a command with given body to the hub. The returned promise gets resolved
   * with a generic hub response without any content or error (eg. device not existing).
   */
  send(action: string, body: string | {command: string, deviceId: string, type?:string}): Promise<{}> {
    debug("send command '" + action + "' with body " + body);
    
    var simpleAcknowledge = stanza => {
      return stanza.getChild("oa") === undefined;
    };

    if (typeof body == "string") {
      return this.request(action, body, undefined, simpleAcknowledge);
    }
    else if (body && body.command && body.deviceId) {
      return this.request(action,
        `{"command"::"${body.command}","type"::"${body.type || 'IRCommand'}","deviceId"::"${body.deviceId}"}`,
        undefined, simpleAcknowledge);
    }
    else {
      return Promise.reject(
        "With the send command you need to provide a body parameter which can be a string or {command: string, deviceId: string, type?:string}"
      );
    }
  }

  /**
   * Closes the connection the the hub. You have to create a new client if you would like
   * to communicate again with the hub.
   */
  end() {
    debug("close harmony client");
    this._xmppClient.end();
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
    __type: string;
    IRCommandName: string;
    Order: number;
    Duration: any;
    ActionId: number;
  }

  export class ControlGroup {
    name: string;
    function: Array<Function>;
  }

  export class Function {
    action: string;
    name: string;
    label: string;
  }

  export class StateDigest {
    activityId: string;
    activityStatus: StateDigestStatus;
  }

  export enum StateDigestStatus {
    HUB_IS_OFF = 0,
    ACTIVITY_STARTING = 1,
    ACTIVITY_STARTED = 2,
    HUB_TURNING_OFF = 3
  }
}

export default HarmonyClient;