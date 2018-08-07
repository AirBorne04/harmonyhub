var debug = require('debug')('harmonyhub:client:login:auth');
var request = require('request');
var logitechUrl = 'https://svcs.myharmony.com/CompositeSecurityServices/Security.svc/json/GetUserAuthToken';

/** Function: getUserAuthToken
 * Connects to Logitechs web service to retrieve a userAuthToken. This token
 * then can be used to login to a Harmony hub as guest.
 *
 * Parameters:
 *     (String) email - E-mail address of a Harmony account
 *     (String) password - Password of a Harmony account
 *
 * Returns:
 *     (Promise) - When resolved, passes the userAuthToken.
 */
function getUserAuthToken (email, password) {
  debug('retrieve userAuthToken from logitech for email ' + email);

  return new Promise((resolve, reject) => {
    request.post({
      method: 'post',
      url: logitechUrl,
      json: true,
      body: {
        email: email,
        password: password
      }
    }, function (error, response, body) {
      if (!error) {
        if (!body.ErrorCode) {
          debug('userAuthToken retrieved');
  
          var authToken = body.GetUserAuthTokenResult.UserAuthToken;
          debug('authToken: ' + authToken);
  
          resolve(authToken);
        } else {
          debug('failed to retrieve userAuthToken');
  
          reject(new Error(
            'Could not retrieve userAuthToken via Logitech! ' +
            'Please check email & password.'
          ));
        }
      } else {
        debug('HTTP error: ' + error);
        reject(error);
      }
    });
  });
}

module.exports = getUserAuthToken
