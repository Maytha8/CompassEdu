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

describe('app.getAllLocations', function() {
  it('should throw an error if the request fails', async function() {
    nockBase
      .get('/Services/ReferenceDataCache.svc/GetAllLocations?sessionstate=readonly')
      .reply(404, {});

    // assert.throwsAsync(async function() {
    //   await app.getAllLocations();
    // }, Error, "Response failed with status 404");
    try {
      await app.getAllLocations();
    } catch (e) {
      assert.instanceOf(e, Error, "an Error object should be thrown");
      assert.equal(e.message, "Request failed with status code 404", "the error should have the correct message");
    }
  });
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
    assert.typeOf(locations[0], 'object', "the array items should be objects");
    assert.typeOf(locations[1], 'object', "the array items should be objects");
    assert.instanceOf(locations[0], CompassEduLocation, "the array items should be objects that are instances of CompassEduLocation");
    assert.instanceOf(locations[1], CompassEduLocation, "the array items should be objects that are instances of CompassEduLocation");

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
