"use strict";

/**
 * CompassEdu package
 * @module CompassEdu
 */

const CompassEdu        = require("./src/CompassEdu")
const CompassEduRequest = require("./src/CompassEduRequest")

// Expose root command
module.exports = CompassEdu;

// Expose individual classes
module.exports.CompassEdu        = CompassEdu;
module.exports.CompassEduRequest = CompassEduRequest;
