var compassedu              = require('../')
  , { CompassEdu }          = require('../src/CompassEdu')
  , { CompassEduLocation }  = require('../src/CompassEduLocation')
  , app                     = new compassedu('https://test.compass.education')
  , nock                    = require('nock')
  , chai                    = require('chai')
  , assert                  = chai.assert
  , nockBase                = nock('https://test.compass.education');

describe('app.authenticate', function() {
  it('should authenticate the user using the credentials provided', async function() {
    nockBase
      .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=testuser&password=testpassword')
      .reply(302, '', {
        'set-cookie': [
          'username=TESTUSER',
          'cpssid_testing=testAuthKey'
        ]
      });

    const auth = await app.authenticate('testuser', 'testpassword');

    assert.isTrue(auth, "app.authenticate should return true when successful");
  });
  it('should acknowledge that the user is authenticated', function() {
    assert.equal(app.authenticated, true, "the app should be authorized");
  });
  it('should give the username the app is authenticated as', function() {
    assert.equal(app.username, 'testuser', "the username should be testuser");
  });
});
