"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const logger = require("debug");
var debug = logger("harmonyhub:client:login:auth");
var logitechUrl = "https://svcs.myharmony.com/CompositeSecurityServices/Security.svc/json/GetUserAuthToken";
/** Function: getUserAuthToken
 * Connects to Logitechs web service to retrieve a userAuthToken. This token
 * then can be used to login to a Harmony hub as guest.
 */
function getUserAuthToken(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        debug("retrieve userAuthToken from logitech for email " + email);
        return new Promise((resolve, reject) => {
            request.post({
                method: "post",
                url: logitechUrl,
                json: true,
                body: {
                    email: email,
                    password: password
                }
            }, function (error, response, body) {
                if (!error) {
                    if (!body.ErrorCode) {
                        debug("userAuthToken retrieved");
                        var authToken = body.GetUserAuthTokenResult.UserAuthToken;
                        debug("authToken: " + authToken);
                        resolve(authToken);
                    }
                    else {
                        debug("failed to retrieve userAuthToken");
                        reject(new Error("Could not retrieve userAuthToken via Logitech! " +
                            "Please check email & password."));
                    }
                }
                else {
                    debug("HTTP error: " + error);
                    reject(error);
                }
            });
        });
    });
}
exports.getUserAuthToken = getUserAuthToken;
exports.default = getUserAuthToken;
