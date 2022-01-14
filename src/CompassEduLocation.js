'use strict';

class CompassEduLocation {

  /**
   * The parent CompassEdu object
   * @type {CompassEdu}
   * @readonly
   */
  parent = null;

  /**
   * Whether the location is archived
   * @type {Boolean}
   * @readonly
   */
  archived = false;

  /**
   * Name of the building
   * @type {String}
   * @readonly
   */
  building = "";

  /**
   * The ID of the room
   * @type {Int}
   * @readonly
   */
  id = null;

  /**
   * The long name of the building
   * @type {String}
   * @readonly
   */
  longName = "";

  /**
   * The short name of the room
   * @type {String}
   * @readonly
   */
  name = "";

  /**
   * The long name of the room
   * @type {String}
   * @readonly
   */
  roomName = "";

  /**
   * The constructor
   * @param {CompassEdu} parentObj - The parent CompassEdu object
   * @param {Object}     data      - The raw data from the request
   */
  constructor(parentObj, data) {
    if (arguments.length < 2) {
      throw new TypeError("CompassEduLocation requires at least 2 arguments, but only "+arguments.length+" were passed");
    }
    if (
      data.hasOwnProperty('archived') &&
      data.hasOwnProperty('bulding') &&
      data.hasOwnProperty('id') &&
      data.hasOwnProperty('longName') &&
      data.hasOwnProperty('n') &&
      data.hasOwnProperty('roomName')
    ) {
      Object.defineProperties(this, {
        parent: {
          value: parentObj,
          writable: false,
          enumerable: true
        },
        archived: {
          value: data.archived,
          writable: false,
          enumerable: true
        },
        building: {
          value: data.building,
          writable: false,
          enumerable: true
        },
        id: {
          value: data.id,
          writable: false,
          enumerable: true
        },
        longName: {
          value: data.longName,
          writable: false,
          enumerable: true
        },
        name: {
          value: data.n,
          writable: false,
          enumerable: true
        },
        roomName: {
          value: data.roomName,
          writable: false,
          enumerable: true
        },
      });
    } else {
      throw new TypeError('CompassEduLocation requires a data object with the properties: archived, building, id, n, and roomName.')
    }
  }

}

module.exports.CompassEduLocation = CompassEduLocation;
