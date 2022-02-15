'use strict';

/**
 * CompassEdu authentication error class.
 * @extends Error
 * */
class CompassEduAuthError extends Error {

  /**
   * Construct a new CompassEduAuthError instance.
   * @param {String} message - The error message.
   */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }

}

module.exports.CompassEduAuthError = CompassEduAuthError;
