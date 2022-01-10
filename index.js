"use strict";

/**
 * CompassEdu package
 * @module CompassEdu
 */

const CompassEdu        = require("./classes/CompassEdu")
const CompassEduRequest = require("./classes/CompassEduRequest")

// Expose root command
module.exports = CompassEdu;

// Expose individual classes
module.exports.CompassEdu        = CompassEdu;
module.exports.CompassEduRequest = CompassEduRequest;
