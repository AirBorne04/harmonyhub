// import * as request from "request";
// import * as logger from "debug";
// var debug = logger("harmonyhub:client:login:auth");
// var logitechUrl = "https://svcs.myharmony.com/CompositeSecurityServices/Security.svc/json/GetUserAuthToken";
// /** Function: getUserAuthToken
//  * Connects to Logitechs web service to retrieve a userAuthToken. This token
//  * then can be used to login to a Harmony hub as guest.
//  */
// export async function getUserAuthToken (email: string, password: string): Promise<string> {
//   debug("retrieve userAuthToken from logitech for email " + email);
//   return new Promise<string>((resolve, reject) => {
//     request.post({
//       method: "post",
//       url: logitechUrl,
//       json: true,
//       body: {
//         email: email,
//         password: password
//       }
//     }, function (error, response, body) {
//       if (!error) {
//         if (!body.ErrorCode) {
//           debug("userAuthToken retrieved");
//           var authToken: string = body.GetUserAuthTokenResult.UserAuthToken;
//           debug("authToken: " + authToken);
//           resolve(authToken);
//         } else {
//           debug("failed to retrieve userAuthToken");
//           reject(new Error(
//             "Could not retrieve userAuthToken via Logitech! " +
//             "Please check email & password."
//           ));
//         }
//       } else {
//         debug("HTTP error: " + error);
//         reject(error);
//       }
//     });
//   });
// }
// export default getUserAuthToken;
