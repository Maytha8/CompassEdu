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
   * Create a CompassEduURL object
   * @param {string}     input  - The absolute or relative input URL to parse. If `input` is relative, then `base` is required. If `input` is absolute, the `base` is ignored.
   * @param {string|URL} [base] - The base URL to resolve against if the `input` is not absolute.
   * @param {string}     keykey - The key of the authentication key used for requests.
   * @param {string}     key    - The authentication key used for requests.
   */
  constructor(input, base, keykey, key) {
    super(input, base);
    this.#authKeyKey = keykey;
    this.#authKey = key;
  }

  /**
   * Request callback
   * @callback CompassEduURL~requestCallback
   * @param    {http.IncomingMessage} res - See [http.IncomingMessage](https://nodejs.org/api/http.html#class-httpincomingmessage).
   */
  /**
   * Make request using URL
   * @param {string}          method            - The request method
   * @param {CompassEduURL~requestCallback} callback          - The callback that handles the response
   * @param {object}          [data]            - Payload to send with request
   * @param {boolean}         [urlEncode=false] - Whether to url-encode the payload or send it in json format
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
  request(keykey, key, method, callback, data, urlEncoded = false) {
    // Quickly validate data
    if (!this.#validateRequestArgs(keykey, key, method, callback, data, urlEncoded)) {
      return;
    }
    if (data) {
      // Prepare data
      if (urlEncoded) {
        const payload = URLSearchParams(data).toString();
      } else {
        const payload = JSON.stringify(data);
      }
      // Make request
      const req = https.request(this.href, {method: method, headers: {
        'Content-Type': (urlEncoded ? 'application/x-www-form-urlencoded' : 'application/json'),
        'Content-Length': payload.length
      }}, callback);
      // Write data
      req.write(payload);
    } else {
      // Make request
      const req = https.request(this.href, {method: method}, callback)
    }
    // Return request
    return req;
  }

  /**
   * Validate the arguments passed to request().
   * @param {*} method
   * @param {*} callback
   * @param {*} data
   * @param {*} urlEncode
   * @private
   */
  #validateRequestArgs(keykey, key, method, callback, data, urlEncoded) {
    // Validate keykey
    if (typeof keykey !== "string") {
      return false;
    }
    // Validate key
    if (typeof key !== "string") {
      return false;
    }
    // Validate method
    if (typeof method !== "string" || !["get", "post"].includes(method.toLowerCase())) {
      return false;
    }
    // Validate callback
    if (typeof callback !== "function") {
      return false;
    }
    // Validate data
    if (typeof data !== "object" && data !== "undefined") {
      return false;
    }
    // Validate urlEncoded
    if (typeof urlEncoded !== "boolean") {
      return false;
    }
    // All done!
    return true;
  }

}

module.exports.CompassEduURL = CompassEduURL;
