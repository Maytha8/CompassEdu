'use strict';

const axios = require('axios');
const { URLSearchParams } = require("url");
const { CompassEduLocation } = require("./CompassEduLocation");

/** CompassEdu class. */
class CompassEdu {

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
   * @readonly
   */
  baseURL = null;

  /**
   * Whether the object is logged in and authorized.
   * @type {boolean}
   * @readonly
   */
  authenticated = false;

  /**
   * The username that the object is logged in as.
   * @type {string}
   * @readonly
   */
  username = "";

  /**
   * The password that was used to authenticate the object with Compass Edu.
   * @type {string}
   * @private
   */
  #authPassword = "";

  /**
   * See {@tutorial gettingstarted}.
   * Create a CompassEdu object.
   * @param {string} url - The base URL for the school-specific Compass website without the trailing slash.
   */
  constructor(url) {
    if (arguments.length < 1) {
      throw new TypeError("CompassEdu requires at least 1 argument, but only "+arguments.length+" were passed");
    }
    Object.defineProperty(this, 'baseURL', {
      value: url,
      writable: false,
      enumerable: true
    });
    // Make properties readonly
    Object.defineProperties(this, {
      username: {writable:false,configurable:true},
      authenticated: {writable:false,configurable:true}
    })
  }

  /**
   * Authenticate using the supplied credentials.
   * @param {string} username - The username of the user to login as.
   * @param {string} password - The plaintext password of the user to login as.
   */
  async authenticate(username, password) {
    if (arguments.length < 2) {
      throw new TypeError("CompassEdu.authenticate requires at least 2 arguments, but only "+arguments.length+" were passed");
    }
    Object.defineProperty(this, 'username', {
      value: username,
      writable: false,
      enumerable: true,
      configurable: true
    });
    this.#authPassword = password;
    try {
      const res = await axios.request({
        url: "/login.aspx?sessionstate=disabled",
        baseURL: this.baseURL,
        method: 'post',
        transformRequest: this.#getTransformRequestFn('urlencoded'),
        maxRedirects: 0,
        data: {
          '__EVENTTARGET': 'button1',
          username: this.username,
          password: this.#authPassword
        },
        validateStatus(status) {return status >= 200 && status <= 302}
      });
      if (res.headers["set-cookie"].filter((cookie) => cookie.startsWith("username=")).length > 0 && res.status == 302) {
        var cpssid = res.headers["set-cookie"].filter((cookie) => cookie.startsWith("cpssid_"));
        if (cpssid.length > 0) {
          const authKey = cpssid[0].substring(0, cpssid[0].indexOf(';') != -1 ? cpssid[0].indexOf(';') : cpssid.length).split("=");
          this.#authKeyKey = authKey[0];
          this.#authKey = authKey[1];
          Object.defineProperty(this, 'authenticated', {value:true,writable:false})
          return true;
        } else {
          const err = new Error('Invalid credentials');
          err.name = "AuthError";
          throw err;
        }
      } else {
        const err = new Error('Invalid credentials');
        err.name = "AuthError";
        throw err;
      }
    } catch (e) {
      const err = new Error('Invalid credentials');
      err.name = "AuthError";
      throw err;
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
    }
    // } else if (type === 'json') {
    //   return function(data) {
    //     return JSON.stringify(data);
    //   }
    // }
  }

  /**
   * Get all locations
   * @return {Array.<CompassEduLocation>} - Array of locations.
   */
  async getAllLocations() {
    try {
      const res = await axios.request({
        url: "/Services/ReferenceDataCache.svc/GetAllLocations?sessionstate=readonly",
        baseURL: this.baseURL,
        method: 'get',
        maxRedirects: 0,
        validateStatus(status) {return status === 200}
      });
      var locations = [];
      res.data.d.forEach((item, index) => {
        locations[index] = new CompassEduLocation(this, item);
      });
      return locations;
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
        baseURL: this.baseURL,
        method: 'get',
        maxRedirects: 0,
        validateStatus(status) {return status === 200}
      });
      var data = res.data.d;
      data.forEach((item, index) => {
        delete data[index]['__type'];
      });
      return data;
    } catch (e) {
      throw e;
    }
  }

}

module.exports.CompassEdu = CompassEdu;
