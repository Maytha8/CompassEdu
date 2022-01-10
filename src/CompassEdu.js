"use strict";

const https = require('https');
//const { URL, URLSearchParams } = require("url");
const { CompassEduURL } = require('./CompassEduURL');

/** CompassEdu class. */
class CompassEdu {

  /**
   * The last error that was thrown.
   * @type {errors.Error}
   * @public
   */
  error = false;

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
   * Create a CompassEdu object and login. This is a "thenable".
   * @param {string} url - The base URL for the school-specific Compass website without the trailing slash.
   * @param {string} username - The username of the user to login as.
   * @param {string} password - The plaintext password of the user to login as.
   */
  constructor(url, username, password) {
    this.#baseURL = url;
  }

  then(resolve, reject) {
    const reqURL = new CompassEduURL("/login.aspx?sessionstate=disabled", url);
    const req = reqURL.request('post', function(res) {
      console.log(res.headers);
      if (Object.keys(res.headers["set-cookie"]).filter((cookie) => cookie.startsWith("username=")).length > 0 && res.statusCode == 302) {
        var cpssidKey = Object.keys(res.headers["set-cookie"]).filter((cookie) => cookie.startsWith("cpssid_"));
        if (cpssidKey.length > 0) {
          this.#authKeyKey = cpssidKey;
          this.#authKey = res.headers["set-cookie"][cpssidKey];
          this.#authValid = true;
          resolve();
        } else {
          reject(new Error("Invalid credentials"));
        }
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, {
      '__EVENTTARGET': 'button1',
      username: username,
      password: password
    }, true);
    req.on('error', function(e) {
      reject(e);
    });
    req.end();
  }

  /**
   * Get all locations
   * @param {int} [limit=25]
   * @param {int} [page=1]
   * @param {int} [start=0]
   */
  async getAllLocations(limit = 25, page = 1, start = 0) {
    var r;
    const url = new CompassEduURL("/Services/ReferenceDataCache.svc/GetAllLocations?sessionstate=readonly", this.#baseURL);
    url.setAuth(this.#authKeyKey, this.#authKey);
    url.searchParams.append('limit', limit);
    url.searchParams.append('page', page);
    url.searchParams.append('start', start);
    url.request('get', function(res) {
      if (res.statusCode == 200) {
        res.on("data", function(d) {
          
        });
      } else {
        this.error = new Error();
        cb();
      }
    });
  }
}

module.exports.CompassEdu = CompassEdu;
