'use strict';

const axios = require('axios');
const { validate } = require('bycontract');
const { URLSearchParams, URL } = require('url');
const { JSDOM } = require('jsdom');
const { CompassEduAuthError } = require('./CompassEduAuthError');

/** CompassEdu authentication handling class. */
class CompassEduAuth {

  /**
   * The base URL used for requests.
   * @type {?String}
   * @private
   */
  #baseURL = null;

  /**
   * Get the base URL used for requests.
   * @returns {?String} - The base URL used for requests.
   */
  getBaseURL() {
    return this.#baseURL;
  }

  /**
   * The authentication header that can be used for requests.
   * @type {?String}
   * @private
   */
  #authHeader = null;

  /**
   * Get the authentication header that can be used for requests.
   * @protected
   * @returns {?String} - The authentication header that can be used for requests.
   */
  _getAuthHeader() {
    return this.#authHeader;
  }

  /**
   * The username that was used to authenticate.
   * @type {?String}
   * @private
   */
  #username = null;

  /**
   * Get the username that was used to authenticate.
   * @returns {?String} - The userrname that was used to authenticate.
   */
  getUsername() {
    return this.#username;
  }

  /**
   * The password that was used to authenticate.
   * @type {?String}
   * @private
   */
  #password = null;

  /**
   * Whether the object is authenticated or not.
   * @returns {Boolean} - Whether the object is authenticated or not.
   */
  async getAuthenticated() {
    if (this._getAuthHeader() === null) {
      // We haven't even tried logging in, so we know we aren't authenticated.
      return false;
    } else {
      // Make request to home page and see if we get redirected.
      try {
        const res = await axios.request({
          url: '/',
          baseURL: this.getBaseURL(),
          method: 'get',
          maxRedirects: 0,
          validateStatus(status) {
            return status >= 200 && status <= 302;
          },
          headers: {
            cookie: this._getAuthHeader(),
          },
        });
        if (res.status == 200) {
          // It didn't redirect us, so we must be authenticated.
          return true;
        } else {
          // It redirected us to the login page, so the auth header must be expired or incorrect.
          // i.e. we are not authenticated.
          return false;
        }
      } catch (e) {
        throw e;
      }
    }
  }

  /**
   * Construct a new authentication handler object.
   * @param {String} url - The base URL of the school-specific Compass website.
   */
  constructor(url) {
    validate(arguments, ['string']);
    this.#baseURL = new URL(url).href;
  }

  /**
   * Authenticate using the passed credentials.
   * @param {String} username - The username of the user to authenticate as.
   * @param {String} password - The plaintext password of the user to authenticate as.
   * @returns {Boolean} - `true` on success. Throws an error on failure.
   */
  async authenticate(username, password) {
    validate(arguments, ['string', 'string']);
    try {
      const res = await axios.request({
        url: '/login.aspx?sessionstate=disabled',
        baseURL: this.getBaseURL(),
        method: 'post',
        transformRequest(data) {
          return (new URLSearchParams(data)).toString();
        },
        maxRedirects: 0,
        data: {
          '__EVENTTARGET': 'button1',
          'username': username,
          'password': password,
        },
        validateStatus(status) {
          return status >= 200 && status <= 302;
        },
      });
      if (res.headers && res.headers['set-cookie'] && res.headers['set-cookie'].filter((cookie) => cookie.startsWith('username=')).length > 0 && res.status == 302) {
        const cpssid = res.headers['set-cookie'].filter((cookie) => cookie.startsWith('cpssid_'));
        if (cpssid.length > 0) {
          const authHeader = cpssid[0].substring(0, cpssid[0].indexOf(';') != -1 ? cpssid[0].indexOf(';') : cpssid.length);
          this.#authHeader = authHeader;
          this.#username = username;
          this.#password = password;
          return true;
        } else {
          throw new CompassEduAuthError('Invalid credentials');
        }
      } else {
        if (res.data) {
          const dom = (new JSDOM(res.data)).window.document;
          if (dom.getElementById('username-error')) {
            switch (dom.getElementById('username-error').innerHTML) {
              case 'Your account has been temporarily disabled due to a large number of login attempts. <br>Please wait a moment and try again.':
                throw new CompassEduAuthError('Too many login attempts');
              case 'Sorry - your username and/or password was incorrect.':
                throw new CompassEduAuthError('Invalid credentials');
              default:
                throw new CompassEduAuthError('An unknown error occurred');
            }
          } else {
            throw new CompassEduAuthError('An unknown error occurred');
          }
        } else {
          throw new CompassEduAuthError('An unknown error occurred');
        }
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Check if we are still authenticated. If not, fetch a new auth header.
   * @protected
   * @returns {Boolean|Error} - `true` on success and an error on failure.
   */
  async _checkAuth() {
    let authenticated = false;
    try {
      authenticated = await this.getAuthenticated();
    } catch (e) {
      return e;
    }
    if (authenticated) {
      return true;
    } else {
      try {
        await this.authenticate(this.#username, this.#password);
        return true;
      } catch (e) {
        return e;
      }
    }
  }

}

module.exports.CompassEduAuth = CompassEduAuth;
