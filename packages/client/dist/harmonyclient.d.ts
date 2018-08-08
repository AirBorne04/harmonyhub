/// <reference types="node" />
import { EventEmitter } from "events";
/**
 * Creates a new HarmonyClient using the given xmppClient to communication.
 * @param xmppClient
 */
export declare class HarmonyClient extends EventEmitter {
    _xmppClient: any;
    _responseHandlerQueue: Array<any>;
    constructor(xmppClient: any);
    handleStanza(stanza: any): void;
    /**
     * The state digest is caused by the hub to let clients know about remote updates
     * @param {message} stateDigest
     */
    onStateDigest(stateDigest: any): void;
    /**
     * Returns the latest turned on activity from a hub.
     *
     * @returns Promise
     */
    getCurrentActivity(): Promise<any>;
    /**
     * Retrieves a list with all available activities.
     */
    getActivities(): Promise<any>;
    /**
     * Starts an activity with the given id.
     *
     * @param activityId
     * @returns Promise
     */
    startActivity(activityId: any): Promise<Object>;
    /**
     * Turns the currently running activity off. This is implemented by "starting" an imaginary activity with the id -1.
     */
    turnOff(): Promise<Object>;
    /**
     * Checks if the hub has now activity turned on. This is implemented by checking the hubs current activity. If the
     * activities id is equal to -1, no activity is on currently.
     */
    isOff(): Promise<boolean>;
    /**
     * Acquires all available commands from the hub when resolving the returned promise.
     */
    getAvailableCommands(): Promise<Object>;
    /**
     * Builds an IQ stanza containing a specific command with given body, ready to send to the hub.
     *
     * @param command
     * @param body
     * @returns {Stanza}
     */
    buildCommandIqStanza(command: string, body: string): any;
    defaultCanHandleStanzaPredicate(awaitedId: string, stanza: any): boolean;
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
    request(command: string, body?: any, expectedResponseType?: string, canHandleStanzaPredicate?: (string) => boolean): Promise<Object>;
    /**
     * Sends a command with given body to the hub. The returned promise gets immediately resolved since this function does
     * not expect any specific response from the hub.
     *
     * @param command
     * @param body
     * @returns Promise
     */
    send(command: any, body: any): void;
    /**
     * Closes the connection the the hub. You have to create a new client if you would like to communicate again with the
     * hub.
     */
    end(): void;
}
export default HarmonyClient;
