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

    assert.isTrue(auth, "app.authenticate should return true when successful");
  });
  it('should acknowledge that the user is authenticated', function() {
    assert.equal(app.authenticated, true, "the app should be authorized");
  });
  it('should give the username the app is authenticated as', function() {
    assert.equal(app.username, 'testuser', "the username should be testuser");
  });
});

describe('app.getAllLocations', function() {
  it('should get all locations as an array of CompassEduLocation objects', async function() {
    nockBase
      .get('/Services/ReferenceDataCache.svc/GetAllLocations?sessionstate=readonly')
      .reply(200, {
        d: [
          {
            "__type": "LC",
            archived: false,
            building: "Building",
            id: 1,
            longName: "Education Room 1",
            n: "EDU1",
            roomName: "EDU1 (Building)"
          },
          {
            "__type": "LC",
            archived: true,
            building: "Another Building",
            id: 2,
            longName: "Education Room 2",
            n: "EDU2",
            roomName: "EDU2 (Another Building)"
          }
        ]
      });

    const locations = await app.getAllLocations();

    assert.typeOf(locations, 'array', "the app should return an array");
    assert.equal(locations.length, 2, "the app should return the correct amount of locations");
    assert.typeOf(locations[0], 'object', "the locations should be objects");
    assert.typeOf(locations[1], 'object', "the locations should be objects");
    assert.instanceOf(locations[0], CompassEduLocation, "the location objects should be instances of CompassEduLocation");
    assert.instanceOf(locations[1], CompassEduLocation, "the location objects should be instances of CompassEduLocation");

    assert.instanceOf(locations[0].parent, CompassEdu, "the parent value should be set to the app");
    assert.isFalse(locations[0].archived, "the location should not be archived");
    assert.equal(locations[0].building, "Building", "the building name should equal the one from the request");
    assert.equal(locations[0].id, 1, "the id should equal the one from the request");
    assert.equal(locations[0].roomLongName, "Education Room 1", "the room long name should equal the one from the request");
    assert.equal(locations[0].roomName, "EDU1", "the room name should equal the one from the request");

    assert.instanceOf(locations[1].parent, CompassEdu, "the parent value should be set to the app");
    assert.isTrue(locations[1].archived, "the location should be archived");
    assert.equal(locations[1].building, "Another Building", "the building name should equal the one from the request");
    assert.equal(locations[1].id, 2, "the id should equal the one from the request");
    assert.equal(locations[1].roomLongName, "Education Room 2", "the room long name should equal the one from the request");
    assert.equal(locations[1].roomName, "EDU2", "the room name should equal the one from the request");
  });
});
