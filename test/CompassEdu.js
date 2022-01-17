var compassedu              = require('../')
  , { CompassEdu }          = require('../src/CompassEdu')
  , { CompassEduLocation }  = require('../src/CompassEduLocation')
  , app                     = new compassedu('https://test.compass.education')
  , nock                    = require('nock')
  , chai                    = require('chai')
  , assert                  = chai.assert
  , nockBase                = nock('https://test.compass.education');

describe('CompassEdu', function() {
  it('should return an object with authentication and request methods', function() {
    assert.typeOf(app, 'object');
    assert.instanceOf(app, CompassEdu);

    // Properties
    assert.typeOf(app.baseURL, 'string');
    assert.typeOf(app.username, 'string');
    assert.typeOf(app.authenticated, 'boolean');

    // Functions
    assert.typeOf(app.authenticate, 'function');
    assert.typeOf(app.getAllLocations, 'function');
    assert.typeOf(app.getChronicleRatings, 'function');
  });
  it('should not be authenticated yet', function() {
    assert.equal(app.username, "", "there should be an empty string for username");
    assert.isFalse(app.authenticated, "the app should not be yet authorized");
  });
  it('should give the base url given when the object was constructed', function() {
    assert.equal(app.baseURL, 'https://test.compass.education', "the base url should be the one given");
  });
  it('should throw an error if less than 1 argument was passed to the constructor', function() {
    assert.throws(() => {
      new CompassEdu();
    }, TypeError, 'CompassEdu requires at least 1 argument, but only 0 were passed');
  });
});
