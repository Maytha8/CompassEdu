var compassedu              = require('../')
  , { CompassEdu }          = require('../src/CompassEdu')
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

describe('app.getChronicleRatings', function() {
  it('should throw an error if the request fails', function() {
    nockBase
      .get('/Services/ReferenceDataCache.svc/GetChronicleRatings')
      .reply(404, {});

    assert.throwsAsync(async function() {
      await app.getChronicleRatings();
    }, Error, "Response failed with status 404")
  });
  it('should get all chronical ratings as an array of objects', async function() {
    nockBase
      .get('/Services/ReferenceDataCache.svc/GetChronicleRatings')
      .reply(200, {
        d: [
          {
            description: "Green",
            enumValue: 1,
            group: null,
            name: "Green",
            ordinal: 0,
            stringEnumValue: null,
            '__type': "GenericEnumLine:Jdlf.Compass.Business.Transport"
          },
          {
            description: "Red",
            enumValue: 2,
            group: null,
            name: "Red",
            ordinal: 0,
            stringEnumValue: null,
            '__type': "GenericEnumLine:Jdlf.Compass.Business.Transport"
          }
        ]
      });

    const ratings = await app.getChronicleRatings();

    assert.typeOf(ratings, 'array', "the app should return an array");
    assert.equal(ratings.length, 2, "the app should return the correct amount of ratings");
    assert.typeOf(ratings[0], 'object', "the array items should be objects");
    assert.typeOf(ratings[1], 'object', "the array items should be objects");

    assert.equal(ratings[0].description, "Green");
    assert.equal(ratings[0].enumValue, 1);
    assert.isNull(ratings[0].group);
    assert.equal(ratings[0].name, "Green");
    assert.equal(ratings[0].ordinal, 0);
    assert.isNull(ratings[0].stringEnumValue);
    assert.isUndefined(ratings[0]['__type']);

    assert.equal(ratings[1].description, "Red");
    assert.equal(ratings[1].enumValue, 2);
    assert.isNull(ratings[1].group);
    assert.equal(ratings[1].name, "Red");
    assert.equal(ratings[1].ordinal, 0);
    assert.isNull(ratings[1].stringEnumValue);
    assert.isUndefined(ratings[1]['__type']);
  });
});
