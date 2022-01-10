"use strict";

/**
 * CompassEdu package
 * @module CompassEdu
 */

const { CompassEdu }    = require("./src/CompassEdu")
const { CompassEduURL } = require("./src/CompassEduURL")

// Expose root class
module.exports = CompassEdu;

// Expose individual classes
module.exports.CompassEdu    = CompassEdu;
module.exports.CompassEduURL = CompassEduURL;
