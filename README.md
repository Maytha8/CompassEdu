# CompassEdu
[![npm](https://img.shields.io/npm/v/@maytha8/compassedu?style=flat-square)](https://www.npmjs.com/package/@maytha8/compassedu)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/Maytha8/CompassEdu?label=dev&style=flat-square)](https://github.com/Maytha8/CompassEdu)
[![GitHub issues](https://img.shields.io/github/issues/Maytha8/CompassEdu?style=flat-square)](https://github.com/Maytha8/CompassEdu/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/Maytha8/CompassEdu?style=flat-square)](https://github.com/Maytha8/CompassEdu/pulls)
![Linux build](https://img.shields.io/github/workflow/status/Maytha8/CompassEdu/Node.js%20CI?label=linux&style=flat-square)
![MacOS build](https://img.shields.io/github/workflow/status/Maytha8/CompassEdu/Node.js%20CI%20MacOS?label=macos&style=flat-square)
![Windows build](https://img.shields.io/github/workflow/status/Maytha8/CompassEdu/Node.js%20CI%20Windows?label=win&style=flat-square)
[![Coveralls branch](https://img.shields.io/coveralls/github/Maytha8/CompassEdu/main?style=flat-square)](https://coveralls.io/github/Maytha8/CompassEdu?branch=main)

**Currently under development!**<br>
A package for interacting with Compass Education.

## Installation

The latest stable release is on npm, so you can use:
```sh
npm install @maytha8/compassedu
```

To install straight from the GitHub repository, use the following:
```sh
npm install https://github.com/Maytha8/CompassEdu
```

For contributing to this project, then use this:
```sh
git clone https://github.com/Maytha8/CompassEdu.git
cd CompassEdu
npm install
```

## Usage

**Promise syntax**
```js
const compassedu = require('compassedu');
const app = new compassedu('https://example.compass.education');

app.auth.authenticate('myUsername', 'myPassword')
    .then(function() {
      // your code here
    })
    .catch(function(err) {
      // your error handling here
    });
```

**Async/Await syntax**
```js
const compassedu = require('compassedu');
const app = new compassedu('https://example.compass.education');

(async ()=>{
  try {
    await app.auth.authenticate('myUsername', 'myPassword');
    // your code here
  } catch (e) {
    // your error handling here
  }
})();
```

**Top level await syntax (needs to be an ES module)**
```js
import * from compassedu;
const app = new compassedu('https://example.compass.education');

try {
  await app.auth.authenticate('myUsername', 'myPassword');
  // your code here
} catch (e) {
  // your error handling here
}
```

The documentation and code reference can be found at [https://maytha8.github.io/CompassEdu/](https://maytha8.github.io/CompassEdu).

## What next?
- Follow the [Getting Started](https://maytha8.github.io/CompassEdu/tutorial-gettingstarted.html) tutorial.
- See [the CompassEdu class](https://maytha8.github.io/CompassEdu/CompassEdu.html) for more information on its properties and methods.
