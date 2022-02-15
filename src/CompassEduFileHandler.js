'use strict';

const axios = require('axios');
const { validate, typedef } = require('bycontract');
const { CompassEduAuth } = require('./CompassEduAuth');

/** CompassEdu file asset handling class. */
class CompassEduFileHandler {

  /**
   * The URL of the file.
   * @private
   * @type {String}
   */
  #url = null;

  /**
   * Get the URL of the file.
   * @returns {String} - The URL of the file.
   */
  getURL() {
    return this.#url;
  }

  /**
   * The authentication object.
   * @private
   * @type {CompassEduAuth}
   */
  #auth = null;

  /**
   * The file ID on Compass' servers.
   * @private
   * @type {Number}
   */
  #id = null;

  /**
   * Get the file ID.
   * @returns {Number} - The file ID on Compass' servers.
   */
  getId() {
    return this.#id;
  }

  /**
   * The file's data.
   * @private
   * @type {CompassEduFileHandler~Data}
   */
  #data;

  /**
   * Get the file's data.
   * @returns {CompassEduFileHandler~Data} - The file's data.
   */
  getData() {
    return this.#data;
  }

  /**
   * @typedef  {Object}   CompassEduFileHandler~Data
   * @property {Number}   id                - The ID of the asset.
   * @property {Number}   fileAssetType     - The type of the file.
   * @property {Boolean}  isImage           - Whether the asset is an image.
   * @property {String}   name              - The display name of the file. (The link text)
   * @property {String}   originalFileName  - The original name of the file that was uploaded. (The name of the file when downloaded)
   */

  /**
   * Initiate a new file handler object.
   * @param {String} url                      - The URL of the file.
   * @param {CompassEduAuth} authObj          - The authentication object.
   * @param {CompassEduFileHandler~Data} data - The file's data.
   */
  constructor(url, authObj, data) {
    typedef('CompassEduFileHandler~Data', {
      id: 'number',
      fileAssetType: 'number',
      isImage: 'boolean',
      name: 'string',
      originalFileName: 'string',
    });
    validate(arguments, ['string', CompassEduAuth, 'CompassEduFileHandler~Data']);

    this.#url = new URL(url, authObj.getBaseURL()).href;
    this.#auth = authObj;
    this.#id = data.id;
    this.#data = data;
  }

  /**
   * @typedef CompassEduFileHandler~FileDownload
   * @property {String} data - The data.
   * @property {String} name - The name of the file.
   * @property {String} type - The MIME type of the file.
   */

  /**
   * Download the file.
   * @returns {CompassEduFileHandler~FileDownload} - The file's data.
   */
  async download() {
    this.#auth._checkAuth();
    try {
      const res = await axios.request({
        url: this.getURL(),
        method: 'get',
        validateStatus(status) {
          return status === 200;
        },
        headers: {
          cookie: this.#auth._getAuthHeader(),
        },
        responseType: 'blob',
      });
      const data = res.data;
      const name = res.headers['content-disposition'].split(';')[1].split('=')[1];
      const type = res.headers['content-type'];
      return {
        data: data,
        name: name,
        type: type,
      };
    } catch (e) {
      throw e;
    }
  }

}

module.exports.CompassEduFileHandler = CompassEduFileHandler;
