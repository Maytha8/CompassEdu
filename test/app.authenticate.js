var compassedu              = require('../')
  , { CompassEdu }          = require('../src/CompassEdu')
  , { CompassEduLocation }  = require('../src/CompassEduLocation')
  , app                     = new compassedu('https://test.compass.education')
  , nock                    = require('nock')
  , chai                    = require('chai')
  , assert                  = chai.assert
  , nockBase                = nock('https://test.compass.education');

assert.throwsAsync = async function(method, errObj, errMsg) {
  let err = null;
  try {
    await method();
  } catch (e) {
    err = e;
  }
  assert.instanceOf(err, errObj);
  if (errMsg) {
    assert.equal(err.message, errMsg);
  }
};

describe('app.authenticate', function() {
  it('should throw an error if less than 2 arguments were passed to the constructor', async function() {
    assert.throwsAsync(async () => {
      await app.authenticate();
    }, TypeError, 'CompassEdu.authenticate requires at least 2 arguments, but only 0 were passed');
  });
  it('should throw an error when the credentials provided are invalid and refuse to authenticate', async function() {
    nockBase
      .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=testuser&password=testpassword')
      .reply(200, '', {'set-cookie':[]});

    await assert.throwsAsync(async () => {
      await app.authenticate('testuser', 'testpassword');
    }, Error, 'Invalid credentials');

    nockBase
      .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=testuser&password=testpassword')
      .reply(302, '', {
        'set-cookie': [
          'username=TESTUSER'
        ]
      });

    await assert.throwsAsync(async () => {
      await app.authenticate('testuser', 'testpassword');
    }, Error, 'Invalid credentials');
  });
  it('should authenticate the user using the credentials provided when simple set-cookie values are used', async function() {
    nockBase
      .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=testuser&password=testpassword')
      .reply(302, '', {
        'set-cookie': [
          'username=TESTUSER',
          'cpssid_testing=testAuthKey'
        ]
      });

    const auth = await app.authenticate('testuser', 'testpassword');

    assert.isTrue(auth, "app.authenticate should return true when successful when simple set-cookie values are used");
  });
  it('should acknowledge that the user is authenticated when simple set-cookie values are used', function() {
    assert.equal(app.authenticated, true, "the app should be authorized");
  });
  it('should give the username the app is authenticated as when simple set-cookie values are used', function() {
    assert.equal(app.username, 'testuser', "the username should be testuser");
  });
  it('should authenticate the user using the credentials provided', async function() {
    const d1 = new Date();
    d1.setMonth(d1.getMonth() + 6);
    const d2 = new Date();
    d2.setDate(d2.getDate() + 3);
    nockBase
      .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=testuser&password=testpassword')
      .reply(302, '', {
        'set-cookie': [
          'username=TESTUSER; expires='+['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d1.getDay()]+', '+d1.getDate()+'-'+(d1.getMonth()+1)+'-'+d1.getFullYear()+' 00:00:00 GMT; path=/',
          'cpssid_testing=testAuthKey; expires='+['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d2.getDay()]+', '+d2.getDate()+'-'+(d2.getMonth()+1)+'-'+d2.getFullYear()+' 00:00:00 GMT; path=/; HttpOnly'
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
