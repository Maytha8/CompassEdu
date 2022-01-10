"use strict";

const https = require('https');
const { URL } = require('url');

/** CompassEdu external request class. */
class CompassEduRequest {

  /**
   * The URL of the request.
   * @type {string}
   * @public
   */
  reqUrl = "";

  /**
   * The method of the request.
   * @type {string}
   * @public
   */
  reqMethod = "";

  /**
   * Prepare request
   * @example
   * // Make a new request
   * const request = new CompassEduRequest(
   *   "https://myschool.compass.education",
   *   "/Services/ReferenceDataCache.svc/GetAllLocations?sessionstate=readonly",
   *   "GET"
   * );
   * @param {string} baseURL  - The base URL.
   * @param {string} path     - The request path, including the preceding slash.
   * @param {string} method   - The method of the request.
   */
  constructor(baseURL, path, method) {

    // Make and set URL object
    reqUrl = new URL(path, baseURL);

    // Check if request type is valid
    if (["get", "post"].includes(method.toLowerCase())) {
      // Set request type
      reqMethod = method.toLowerCase();
    } else {
      // Otherwise, throw an error
      throw new Error("Invalid request type");
    }

  }

  /**
   * Add query paramaters to request
   * @param {object} params - The parameters to add
   */
  addQueryParams(params) {

    // Loop through parameters
    for (var param in params) {
      reqUrl.searchParams.append(param, params[param]);
    }

  }

  /**
   * Set existing request query paramaters
   * @param {object} params - The parameters to set
   */
  setQueryParams(params) {

    // Loop through parameters
    for (var param in params) {
      reqUrl.searchParams.set(param, params[param]);
    }

  }

  /**
   * Remove query parameters from request
   * @param {array} params - The parameters to remove
   */
  removeQueryParams(params) {

    // Loop through parameters
    for (var param in params) {
      reqUrl.searchParams.remove(param);
    }

  }

}
