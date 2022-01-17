![npm](https://img.shields.io/npm/v/@maytha8/compassedu?style=flat-square)
![Linux build](https://img.shields.io/github/workflow/status/Maytha8/CompassEdu/Node.js%20CI?label=linux&style=flat-square)
![MacOS build](https://img.shields.io/github/workflow/status/Maytha8/CompassEdu/Node.js%20CI%20MacOS?label=macos&style=flat-square)
![Windows build](https://img.shields.io/github/workflow/status/Maytha8/CompassEdu/Node.js%20CI%20Windows?label=win&style=flat-square)

## Installation
This package is on the NPM registry, so you can use the following:
```sh
npm install @maytha8/compassedu
```

To install directly from [the GitHub repository]{@link https://github.com/Maytha8/CompassEdu}, you can use the following:
```sh
npm install https://github.com/Maytha8/CompassEdu
```

## Usage
```js
const compassedu = require('compassedu');
try {
  const app = new compassedu('https://example.compass.education');
  app.authenticate('myUsername', 'myPassword');
  // your code here
} catch (e) {
  // error handling here
}
```

## What next?
- Follow the {@tutorial gettingstarted} tutorial.
- See [the CompassEdu class]{@link CompassEdu} for more information on its members and methods.
