var compassedu = require('../')
  , app = new compassedu('https://test.compass.education')
  , nock = require('nock')
  , chai = require('chai')
  , assert = chai.assert
  , nockBase = nock('https://test.compass.education');

describe('CompassEdu', function() {
  it('should return an object with authentication and request methods', function() {
    assert.typeOf(app, 'object');

    // Properties
    assert.typeOf(app.baseURL, 'null');
    assert.typeOf(app.username, 'string');
    assert.typeOf(app.authenticated, 'boolean');

    // Functions
    assert.typeOf(app.authenticate, 'function');
    assert.typeOf(app.getAllLocations, 'function');
    assert.typeOf(app.getChronicleRatings, 'function');
  });
  it('should not be authenticated yet', function() {
    assert.equal(app.username, "", "there should be an empty string for username");
    assert.equal(app.authenticated, false, "the app should not be yet authorized");
  });
  it('should give the base url given when the object was constructed', function() {
    assert.equal(app.baseURL, 'https://test.compass.education', "the base url should be the one given");
  });
});

describe('app.authenticate', function() {
  it('should authenticate the user using the credentials provided', async function() {
    const req = nockBase
      .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=testuser&password=testpassword')
      .reply(302, '', {
        'set-cookie': [
          'username=TESTUSER',
          'cpssid_testing=testAuthKey'
        ]
      });

    const auth = await app.authenticate('testuser', 'testpassword');

    assert.equal(auth, true, "app.authenticate should return true when successful");
  });
  it('should acknowledge that the user is authenticated', function() {
    assert.equal(app.authenticated, true, "the app should be authorized");
  });
  it('should give the username the app is authenticated as', function() {
    assert.equal(app.username, 'testuser', "the username should be testuser");
  });
});
