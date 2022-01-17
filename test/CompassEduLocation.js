var compassedu              = require('../')
  , { CompassEdu }          = require('../src/CompassEdu')
  , { CompassEduLocation }  = require('../src/CompassEduLocation')
  , app                     = new compassedu('https://test.compass.education')
  , nock                    = require('nock')
  , chai                    = require('chai')
  , assert                  = chai.assert
  , nockBase                = nock('https://test.compass.education');

describe('CompassEduLocation', function() {
  it('should throw an error if less than 2 arguments were passed to the constructor', function() {
    assert.throws(() => {
      new CompassEduLocation();
    }, TypeError, 'CompassEduLocation requires at least 2 arguments, but only 0 were passed');
  });
  it('should throw an error if the data object has insufficient properties', function() {
    assert.throws(() => {
      new CompassEduLocation({}, {});
    }, TypeError, 'CompassEduLocation requires a data object with the properties: archived, building, id, n, and roomName.');
  });
});
