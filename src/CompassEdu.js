"use strict";

const axios = require('axios');
const {
  URLSearchParams
} = require("url");

/** CompassEdu class. */
class CompassEdu {

  /**
   * The last error that occurred.
   * @type {boolean|Error}
   */
  lastErr = false;

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
   * The base URL used for requests.
   * @type {string}
   * @private
   */
  #baseURL = null;

  /**
   * Get the base URL used for requests.
   * @return {string} - The base URL.
   */
  getBaseURL() {
    return this.#baseURL;
  }

  /**
   * Whether the object is logged in and authorized.
   * @type {boolean}
   * @private
   */
  #authValid = false;

  /**
   * The username that the object is logged in as.
   * @type {string}
   * @private
   */
  #authUsername = "";

  /**
   * The password that was used to authenticate the object with Compass Edu.
   * @type {string}
   * @private
   */
  #authPassword = "";

  /**
   * Create a CompassEdu object.
   * @param {string} url - The base URL for the school-specific Compass website without the trailing slash.
   */
  constructor(url) {
    this.#baseURL = url;
  }

  /**
   * Authenticate using the supplied credentials.
   * @param {string} username - The username of the user to login as.
   * @param {string} password - The plaintext password of the user to login as.
   */
  async authenticate(username, password) {
    this.#authUsername = username;
    this.#authPassword = password;
    try {
      const res = await axios.request({
        url: "/login.aspx?sessionstate=disabled",
        baseURL: this.#baseURL,
        method: 'post',
        transformRequest: this.#getTransformRequestFn('urlencoded'),
        maxRedirects: 0,
        data: {
          '__EVENTTARGET': 'button1',
          username: this.#authUsername,
          password: this.#authPassword
        },
        validateStatus: this.#validateStatus
      });
      if (res.headers["set-cookie"].filter((cookie) => cookie.startsWith("username=")).length > 0 && res.status == 302) {
        var cpssid = res.headers["set-cookie"].filter((cookie) => cookie.startsWith("cpssid_"));
        if (cpssid.length > 0) {
          const authKey = cpssid[0].substring(0, cpssid[0].indexOf(';') != -1 ? cpssid[0].indexOf(';') : cpssid.length).split("=");
          this.#authKeyKey = authKey[0];
          this.#authKey = authKey[1];
          this.#authValid = true;
          return true;
        } else {
          const err = new Error("Invalid credentials");
          err.name = "InvalidAuthError";
          this.lastErr = err;
          throw err;
        }
      } else {
        const err = new Error("Invalid credentials");
        err.name = "InvalidAuthError";
        this.lastErr = err;
        throw err;
      }
    } catch (e) {
      console.log("error encountered in auth req");
      return e.toJSON();
    }
  }

  /**
   * Return a function that can encode the request into the desired encoding type
   * @param  {String} type - The desired encoding type
   * @return {Function}    - A function that can be used to encode the request into the desired encoding type
   * @private
   */
  #getTransformRequestFn(type) {
    if (type === 'urlencoded') {
      return function(data) {
        return (new URLSearchParams(data)).toString();
      }
    } else if (type === 'json') {
      return function(data) {
        return JSON.stringify(data);
      }
    }
  }

  /**
   * Parse a JSON response
   * @param {String}  - JSON string
   * @return {Object} - The parsed data as an object
   * @private
   */
  #transformResponse(data) {
    return JSON.parse(data);
  }

  /**
   * @private
   */
  #validateStatus(status) {
    return status >= 200 && status <= 302;
  }

  /**
   * Get the username that the object is logged in as.
   * @retun {string} - The username that the object is logged in as.
   */
  getUsername() {
    return this.#authUsername;
  }

  /**
   * Get whether the object logged in and authorized.
   * @return {boolean} - Whether the object is authorized or not.
   */
  getAuthorized() {
    return this.#authValid;
  }

  /**
   * Get all locations
   * @return {Array.<{archived: Boolean, building: String, id: Int, longName: String, n: String, roomName: String}>} - Array of objects. All the locations at the school.
   */
  async getAllLocations() {
    try {
      const res = await axios.request({
        url: "/Services/ReferenceDataCache.svc/GetAllLocations?sessionstate=readonly",
        baseURL: this.#baseURL,
        method: 'get',
        transformResponse: this.#transformResponse,
        maxRedirects: 0,
        withCredentials: true
      });
      if (res.status == 200) {
        return res.data.d;
      } else {
        const e = new Error("Response failed with status " + res.status);
        e.name = "RequestFailedError";
        throw e;
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Get available chronicle ratings
   * @return {Array.<{description: String, enumValue: Int, group: String|Null, name: String}>} - Array of objects. All the locations at the school.
   */
  async getChronicleRatings() {
    try {
      const res = await axios.request({
        url: "/Services/ReferenceDataCache.svc/GetChronicleRatings",
        baseURL: this.#baseURL,
        method: 'get',
        transformResponse: this.#transformResponse,
        maxRedirects: 0,
        withCredentials: true
      });
      if (res.status == 200) {
        return res.data;
      } else {
        const e = new Error("Response failed with status " + res.status);
        e.name = "RequestFailedError";
        throw e;
      }
    } catch (e) {
      throw e;
    }
  }

}

module.exports.CompassEdu = CompassEdu;
