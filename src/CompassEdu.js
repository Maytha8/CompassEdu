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
   * Whether you are logged in and authorized.
   * @type {boolean}
   * @private
   */
  #authValid = false;

  /**
   * Whether it is authorized or not.
   * @return {boolean} - Whether it is authorized or not.
   */
  getAuthorized() {
    return this.#authValid;
  }

  /**
   * Create a CompassEdu object and login.
   * @param {string} url - The base URL for the school-specific Compass website without the trailing slash.
   * @param {string} username - The username of the user to login as.
   * @param {string} password - The plaintext password of the user to login as.
   */
  constructor(url, username, password) {
    const req = new CompassEduURL("/login.aspx?sessionstate=disabled", url);
    req.request('post', function(res) {
      if (Object.keys(res.headers["set-cookie"]).filter((cookie) => cookie.startsWith("username=")).length > 0 && res.statusCode == 302) {
        var cpssidKey = Object.keys(res.headers["set-cookie"]).filter((cookie) => cookie.startsWith("cpssid_"));
        if (cpssidKey.length > 0) {
          this.#authKeyKey = cpssidKey;
          this.#authKey = res.headers["set-cookie"][cpssidKey];
          this.#baseUrl = url;
          this.#authValid = true;
        } else {
          error = new Error("Invalid credentials");
        }
      } else {
        error = new Error("Invalid credentials");
      }
    }, {
      username: username,
      password: password
    }, true);
    req.on('error', function(e) {
      error = e;
    });
    req.end();
  }

  /**
   * Get all locations
   * @param {int} [limit=25]
   * @param {int} [page=1]
   * @param {int} [start=0]
   */
  getAllLocations(limit = 25, page = 1, start = 0) {
    var r;
    const url = new CompassEduURL("/Services/ReferenceDataCache.svc/GetAllLocations?sessionstate=readonly", this.#baseURL);
    url.searchParams.append('limit', limit);
    url.searchParams.append('page', page);
    url.searchParams.append('start', start);
    url.request('get', function(res) {
      if (res.statusCode == 200) {
        res.on("data", function(d) {
          r = d;
        });
      } else {
        this.error = new Error();
        r = this.error;
      }
    });
  }

}

module.exports.CompassEdu = CompassEdu;
