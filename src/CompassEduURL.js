"use strict";

const https = require('https');
const { URL, URLSearchParams } = require('url');

/**
 * CompassEdu URL class
 * @extends url.URL
 */
class CompassEduURL extends URL {

  /**
   * The authentication key used for requests.
   * @type {string}
   * @private
   */
  #authKey = null;

  /**
   * The key of the authentication key used for requests.
   * @type {string}
   * @private
   */
  #authKeyKey = null;

  /**
   * Set the authentication keys.
   * @param {string} keyKey - The key of the authentication key.
   * @param {string} key    - The authentication key.
   */
  setAuth(keyKey, key) {
    this.#authKeyKey = keyKey;
    this.#authKey = key;
  }

  /**
   * Create a CompassEduURL object
   * @param {string}     input  - The absolute or relative input URL to parse. If `input` is relative, then `base` is required. If `input` is absolute, the `base` is ignored.
   * @param {string|URL} [base] - The base URL to resolve against if the `input` is not absolute.
   * @param {string}     keyKey - The key of the authentication key used for requests.
   * @param {string}     key    - The authentication key used for requests.
   */
  constructor(input, base, keyKey, key) {
    super(input, base);
    this.#authKeyKey = keyKey;
    this.#authKey = key;
  }

  /**
   * Request callback
   * @callback CompassEduURL~requestCallback
   * @param    {http.IncomingMessage} res - See [http.IncomingMessage](https://nodejs.org/api/http.html#class-httpincomingmessage).
   */
  /**
   * Make request using URL
   * @param {string}          method                 - The request method
   * @param {CompassEduURL~requestCallback} callback - The callback that handles the response
   * @param {object}          [data]                 - Payload to send with request
   * @param {boolean}         [urlEncode=false]      - Whether to url-encode the payload or send it in json format
   * @example
   * // Make a request using this url
   * myUrl.request(myKeyKey, myKey, 'post', function(res) {
   *   console.log(res.statusCode);
   *   console.log(res.headers);
   *   res.on('data', function(d) {
   *     console.log(d);
   *   });
   * });
   */
  request(method, callback, data, urlEncoded = false) {
    if (data) {
      // Prepare data
      if (urlEncoded) {
        const payload = URLSearchParams(data).toString();
      } else {
        const payload = JSON.stringify(data);
      }
      // Prepare headers
      var headers = {};
      headers['Content-Type'] = (urlEncoded ? 'application/x-www-form-urlencoded' : 'application/json');
      headers['Content-Length'] = payload.length;
      if (this.#authKey !== null && this.#authKeyKey !== null) {
        
      }
      // Make request
      const req = https.request(this.href, {method: method, headers: headers}, callback);
      // Write data
      req.write(payload);
    } else {
      // Make request
      const req = https.request(this.href, {method: method}, callback)
    }
    // Return request
    return req;
  }

}

module.exports.CompassEduURL = CompassEduURL;
