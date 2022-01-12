var compassedu = require('../')
  , app = new compassedu('https://test.compass.education')
  , chai = require('chai')
  , assert = chai.assert;

it('should return an object with authentication and request methods', function() {
  assert.typeOf(app, 'object');

  assert.typeOf(app.lastErr, 'boolean');
  assert.typeOf(app.getBaseURL, 'function');
  assert.typeOf(app.authenticate, 'function');
  assert.typeOf(app.getUsername, 'function');
  assert.typeOf(app.getAuthorized, 'function');
  assert.typeOf(app.getAllLocations, 'function');
  assert.typeOf(app.getChronicleRatings, 'function');
});

it('should have defaults set', function() {
  assert.equal(app.lastErr, false);
  assert.equal(app.getBaseURL(), 'https://test.compass.education');
  assert.equal(app.getUsername(), "");
  assert.equal(app.getAuthorized(), false);
});
