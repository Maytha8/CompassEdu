'use strict';

/* eslint-disable new-cap */
const compassedu = require('../');
const { CompassEdu } = require('../src/CompassEdu');
const { CompassEduAuth } = require('../src/CompassEduAuth');
const { CompassEduAuthError } = require('../src/CompassEduAuthError');
const { CompassEduFileHandler } = require('../src/CompassEduFileHandler');
const { Exception } = require('bycontract');
const cookieStringGenerator = require('./helper/cookieStringGenerator');
const app = new compassedu('https://test.compass.education');
const nock = require('nock');
const chai = require('chai');
chai.use(require('./helper/throwsAsync'));
const assert = chai.assert;
const nockBase = nock('https://test.compass.education');

describe('CompassEdu', function() {
  it('should return an object with the correct members and methods', function() {
    assert.typeOf(app, 'object', 'app shoud be an object');
    assert.instanceOf(app, CompassEdu, 'app should be a CompassEdu instance');

    // Members
    assert.instanceOf(app.auth, CompassEduAuth, 'app.auth should be a CompassEduAuth instance');

    // Methods
    assert.typeOf(app.getBaseURL, 'function', 'there should be a getBaseURL method');
    assert.typeOf(app.getAllLocations, 'function', 'there should be a getAllLocations method');
    assert.typeOf(app.getChronicleRatings, 'function', 'there should be a getChronicleRatings method');
    assert.typeOf(app.getNewsFeedItemsByActivityId, 'function', 'there should be a getNewsFeedItemsByActivityId method');
  });
  it('should not be authenticated yet', async function() {
    assert.equal(app.username, null, 'there should be an empty string for username');
    assert.isFalse(await app.auth.getAuthenticated(), 'the app should not be yet authorised');
  });
  it('should give the base url given when the object was constructed', function() {
    assert.equal(app.getBaseURL(), 'https://test.compass.education/', 'the base url should be the one given');
  });
  it('should throw an error if no arguments were passed to the constructor', function() {
    assert.throws(() => {
      new CompassEdu();
    }, Exception, 'Missing required argument');
  });
});

describe('CompassEduAuth', function() {
  it('should authenticate successfully', async function() {
    const scope = nockBase
        .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=test.user&password=mySecretPassw0rd123')
        .reply(302, '', {
          'set-cookie': [
            cookieStringGenerator('cpssid_test', 'testToken123'),
            cookieStringGenerator('username', 'TEST.USER'),
          ],
        });
    await app.auth.authenticate('test.user', 'mySecretPassw0rd123');
    scope.done();
  });
  it('should authenticate successfully when non-standard cookie header is used', async function() {
    const app2 = new compassedu('https://test.compass.education');
    const scope = nockBase
        .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=test.user&password=mySecretPassw0rd123')
        .reply(302, '', {
          'set-cookie': [
            'cpssid_test=testToken123',
            'username=TEST.USER',
          ],
        });
    await app2.auth.authenticate('test.user', 'mySecretPassw0rd123');
    scope.done();
  });
  it('should throw an error if there was no redirect and no reason was specified', async function() {
    const app2 = new compassedu('https://test.compass.education/');
    const scope = nockBase
        .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=test.user&password=mySecretPassw0rd123')
        .reply(200, '<!DOCTYPE html><html><body><span id="username-error"></span></body></html>');
    await assert.throwsAsync(async function() {
      await app2.auth.authenticate('test.user', 'mySecretPassw0rd123');
    }, CompassEduAuthError, 'An unknown error occurred');
    scope.done();

    const app3 = new compassedu('https://test.compass.education/');
    const scope2 = nockBase
        .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=test.user&password=mySecretPassw0rd123')
        .reply(200, '<!DOCTYPE html><html><body></body></html>');
    await assert.throwsAsync(async function() {
      await app3.auth.authenticate('test.user', 'mySecretPassw0rd123');
    }, CompassEduAuthError, 'An unknown error occurred');
    scope2.done();
  });
  it('should throw an error if the credentials are incorrect', async function() {
    const app2 = new compassedu('https://test.compass.education/');
    const scope = nockBase
        .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=test.user&password=mySecretPassw0rd123')
        .reply(200, '<!DOCTYPE html><html><body><span id="username-error">Sorry - your username and/or password was incorrect.</span></body></html>');
    await assert.throwsAsync(async function() {
      await app2.auth.authenticate('test.user', 'mySecretPassw0rd123');
    }, CompassEduAuthError, 'Invalid credentials');
    scope.done();
  });
  it('should throw an error if there were too many login attempts', async function() {
    const app2 = new compassedu('https://test.compass.education/');
    const scope = nockBase
        .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=test.user&password=mySecretPassw0rd123')
        .reply(200, '<!DOCTYPE html><html><body><span id="username-error">Your account has been temporarily disabled due to a large number of login attempts. <br />Please wait a moment and try again.</span></body></html>');
    await assert.throwsAsync(async function() {
      await app2.auth.authenticate('test.user', 'mySecretPassw0rd123');
    }, CompassEduAuthError, 'Too many login attempts');
    scope.done();
  });
  it('should throw an error if no headers are in the response', async function() {
    const app2 = new compassedu('https://test.compass.education/');
    const scope = nockBase
        .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=test.user&password=mySecretPassw0rd123')
        .reply(302, '');
    await assert.throwsAsync(async function() {
      await app2.auth.authenticate('test.user', 'mySecretPassw0rd123');
    }, CompassEduAuthError, 'An unknown error occurred');
    scope.done();
  });
  it('should throw an error if insufficient headers are in the response', async function() {
    const app2 = new compassedu('https://test.compass.education/');
    const scope = nockBase
        .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=test.user&password=mySecretPassw0rd123')
        .reply(302, '', {
          'set-cookie': cookieStringGenerator('username', 'TEST.USER'),
        });
    await assert.throwsAsync(async function() {
      await app2.auth.authenticate('test.user', 'mySecretPassw0rd123');
    }, CompassEduAuthError, 'Invalid credentials');
    scope.done();
  });
  it('should have the correct cookie header', function() {
    assert.equal(app.auth._getAuthHeader(), 'cpssid_test=testToken123', 'the app should have the correct cookie string');
  });
  it('should throw an error if no arguments are passed', async function() {
    await assert.throwsAsync(async function() {
      const app2 = new compassedu('https://test.compass.education/');
      await app2.auth.authenticate();
    }, Exception, 'Missing required argument');
  });
  it('should throw an error if incorrect arguments are passed', async function() {
    await assert.throwsAsync(async function() {
      const app2 = new compassedu('https://test.compass.education/');
      await app2.auth.authenticate(123);
    }, Exception, 'Argument #0: expected string but got number');
  });
  it('should recognise that it is authenticated', async function() {
    const scope = nockBase
        .get('/')
        .reply(200);
    assert.isTrue(await app.auth.getAuthenticated(), 'the app should return true when authenticated');
    scope.done();
    assert.equal(app.auth.getUsername(), 'test.user', 'the app should have the correct username authenticated');
  });
  it('should recognise that it is not authenticated when the cookie doesn\'t work', async function() {
    const scope = nockBase
        .get('/')
        .reply(302);
    assert.isFalse(await app.auth.getAuthenticated(), 'the app should return false when redirected');
    scope.done();
  });
  it('should successfully renew authentication', async function() {
    const scope = nockBase
        .get('/')
        .reply(302);
    const scope2 = nockBase
        .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=test.user&password=mySecretPassw0rd123')
        .reply(302, '', {
          'set-cookie': [
            cookieStringGenerator('cpssid_test', 'testToken123'),
            cookieStringGenerator('username', 'TEST.USER'),
          ],
        });
    await app.auth._checkAuth();
    scope.done();
    scope2.done();
  });
  it('should return an error when authentication renewal fails', async function() {
    const scope = nockBase
        .get('/')
        .reply(302);
    const scope2 = nockBase
        .post('/login.aspx?sessionstate=disabled', '__EVENTTARGET=button1&username=test.user&password=mySecretPassw0rd123')
        .reply(500);
    await assert.throwsAsync(async function() {
      throw await app.auth._checkAuth();
    }, Error, 'Request failed with status code 500');
    scope.done();
    scope2.done();
  });
});

describe('CompassEdu.getAllLocations()', function() {
  it('should get all locations successfully', async function() {
    const scope = nockBase
        .get('/Services/ReferenceDataCache.svc/GetAllLocations?sessionstate=readonly')
        .reply(200, {
          d: [
            {
              id: 1,
              archived: false,
              building: 'Test Building',
              longName: 'Test Room',
              n: 'TEST1',
              roomName: 'TEST1 (Test Building)',
            },
            {
              id: 2,
              archived: false,
              building: 'Test Building',
              longName: 'Test Room',
              n: 'TEST2',
              roomName: 'TEST2 (Test Building)',
            },
          ],
        });
    const locations = await app.getAllLocations();
    scope.done();
    assert.deepEqual(locations, [
      {
        id: 1,
        archived: false,
        building: 'Test Building',
        description: 'Test Room',
        name: 'TEST1',
        longName: 'TEST1 (Test Building)',
      },
      {
        id: 2,
        archived: false,
        building: 'Test Building',
        description: 'Test Room',
        name: 'TEST2',
        longName: 'TEST2 (Test Building)',
      },
    ], 'app.getAllLocations() should yield the correct results');
  });
  it('should throw an error if the response was not successful', async function() {
    const scope = nockBase
        .get('/Services/ReferenceDataCache.svc/GetAllLocations?sessionstate=readonly')
        .reply(404);
    await assert.throwsAsync(async function() {
      await app.getAllLocations();
    }, Error, 'Request failed with status code 404');
    scope.done();
  });
});

describe('CompassEdu.getChronicleRatings()', function() {
  it('should get all chronicle ratings successfully', async function() {
    const scope = nockBase
        .get('/Services/ReferenceDataCache.svc/GetChronicleRatings')
        .reply(200, {
          d: [
            {
              name: 'Rating One',
              description: 'The first rating',
              enumValue: 1,
              group: null,
            },
            {
              name: 'Rating Two',
              description: '',
              enumValue: 2,
              group: null,
            },
          ],
        });
    const ratings = await app.getChronicleRatings();
    scope.done();
    assert.deepEqual(ratings, [
      {
        name: 'Rating One',
        description: 'The first rating',
        enumValue: 1,
        group: null,
      },
      {
        name: 'Rating Two',
        description: '',
        enumValue: 2,
        group: null,
      },
    ], 'app.getChroncileRatings() should yield the correct results');
  });
  it('should throw an error if the response was not successful', async function() {
    const scope = nockBase
        .get('/Services/ReferenceDataCache.svc/GetChronicleRatings')
        .reply(404);
    await assert.throwsAsync(async function() {
      await app.getChronicleRatings();
    }, Error, 'Request failed with status code 404');
    scope.done();
  });
});

describe('CompassEdu.getNewsFeedItemsByActivityId()', function() {
  it('should get all news feed items successfully', async function() {
    nockBase
        .get('/')
        .reply(200);
    const scope = nockBase
        .post('/Services/NewsFeed.svc/GetActivityNewsFeedPaged?sessionstate=readonly', {
          activityId: 789,
          limit: 10,
          start: 0,
        })
        .matchHeader('cookie', 'cpssid_test=testToken123')
        .reply(200, {
          d: {
            data: [
              {
                NewsItemId: 1,
                Title: 'News feed item one',
                Content1: 'Lorem ipsum <em>dolor mit</em>',
                PostDateTime: '2019-10-05T11:32:00.000Z',
                EmailSentDate: '2019-10-05T11:33:00.000Z',
                Start: '2019-10-05T11:32:00.000Z',
                End: '2019-10-12T11:32:00.000Z',
                CreatedByAdmin: true,
                Locked: false,
                NewsItemCustomGroupTargets: {
                  CampusIds: [],
                  CustomGroupIds: [],
                },
                NewsItemGroupTargets: [
                  {
                    ActivityIds: [123],
                    BaseRole: 1,
                    CampusIds: [],
                    FormGroups: [],
                    Future: false,
                    Houses: [],
                    UserIds: [],
                    YearLevels: [],
                  },
                ],
                UserId: 123,
                UserName: 'Test User',
                UserImageUrl: '/Assets/Path/To/UserImage.png',
                Attachments: [
                  {
                    AssetId: 456,
                    FileAssetType: 3,
                    IsImage: false,
                    Name: 'My PDF file',
                    OriginalFileName: 'my_pdf_file.pdf',
                    UiLink: '/Assets/Path/To/PDFFile.pdf',
                  },
                ],
              },
            ],
          },
        });
    const newsfeed = await app.getNewsFeedItemsByActivityId(789);
    scope.done();
    assert.deepEqual(newsfeed, [
      {
        id: 1,
        title: 'News feed item one',
        content: 'Lorem ipsum <em>dolor mit</em>',
        postDate: new Date('2019-10-05T11:32:00.000Z'),
        emailSentDate: new Date('2019-10-05T11:33:00.000Z'),
        start: new Date('2019-10-05T11:32:00.000Z'),
        end: new Date('2019-10-12T11:32:00.000Z'),
        createdByAdmin: true,
        locked: false,
        customGroupTargets: {
          campusIds: [],
          customGroupIds: [],
        },
        groupTargets: [
          {
            activityIds: [123],
            baseRole: 1,
            campusIds: [],
            formGroups: [],
            future: false,
            houses: [],
            userIds: [],
            yearLevels: [],
          },
        ],
        sender: {
          userId: 123,
          userName: 'Test User',
          userImageUrl: 'https://test.compass.education/Assets/Path/To/UserImage.png',
        },
        attachments: [
          new CompassEduFileHandler('/Assets/Path/To/PDFFile.pdf', app.auth, {
            id: 456,
            fileAssetType: 3,
            isImage: false,
            name: 'My PDF file',
            originalFileName: 'my_pdf_file.pdf',
          }),
        ],
      },
    ], 'app.getNewsFeedItemsByActivityId() should yield the correct results');
  });
  it('should get all news feed items successfully when a since argument is given', async function() {
    nockBase
        .get('/')
        .reply(200);
    const scope = nockBase
        .post('/Services/NewsFeed.svc/GetActivityNewsFeedPaged?sessionstate=readonly', {
          activityId: 789,
          limit: 10,
          start: 0,
        })
        .matchHeader('cookie', 'cpssid_test=testToken123')
        .reply(200, {
          d: {
            data: [
              {
                NewsItemId: 1,
                Title: 'News feed item one',
                Content1: 'Lorem ipsum <em>dolor mit</em>',
                PostDateTime: '2019-10-05T11:32:00.000Z',
                EmailSentDate: '2019-10-05T11:33:00.000Z',
                Start: '2019-10-05T11:32:00.000Z',
                End: '2019-10-12T11:32:00.000Z',
                CreatedByAdmin: true,
                Locked: false,
                NewsItemCustomGroupTargets: {
                  CampusIds: [],
                  CustomGroupIds: [],
                },
                NewsItemGroupTargets: [
                  {
                    ActivityIds: [123],
                    BaseRole: 1,
                    CampusIds: [],
                    FormGroups: [],
                    Future: false,
                    Houses: [],
                    UserIds: [],
                    YearLevels: [],
                  },
                ],
                UserId: 123,
                UserName: 'Test User',
                UserImageUrl: '/Assets/Path/To/UserImage.png',
                Attachments: [
                  {
                    AssetId: 456,
                    FileAssetType: 3,
                    IsImage: false,
                    Name: 'My PDF file',
                    OriginalFileName: 'my_pdf_file.pdf',
                    UiLink: '/Assets/Path/To/PDFFile.pdf',
                  },
                ],
              },
            ],
          },
        });
    const newsfeed = await app.getNewsFeedItemsByActivityId(789, 1);
    scope.done();
    assert.deepEqual(newsfeed, [], 'app.getNewsFeedItemsByActivityId() should yield the correct results');
  });
  it('should throw an error if the response was not successful', async function() {
    nockBase
        .get('/')
        .reply(200);
    const scope = nockBase
        .post('/Services/NewsFeed.svc/GetActivityNewsFeedPaged?sessionstate=readonly')
        .reply(404);
    await assert.throwsAsync(async function() {
      await app.getNewsFeedItemsByActivityId(789);
    }, Error, 'Request failed with status code 404');
    scope.done();

    await assert.throwsAsync(async function() {
      await app.getNewsFeedItemsByActivityId(789);
    }, Error, 'Unable to obtain valid authorisation header');
  });
});
describe('CompassEduFileHandler', function() {
  let file;
  it('should construct an instance', function() {
    file = new CompassEduFileHandler('/Services/FileAssets.svc/DownloadFile?blah=blah', app.auth, {
      id: 456,
      fileAssetType: 3,
      isImage: false,
      name: 'My file',
      originalFileName: 'my_file.txt',
    });
  });
  it('should have saved the correct information', function() {
    assert.deepEqual(file.getData(), {
      id: 456,
      fileAssetType: 3,
      isImage: false,
      name: 'My file',
      originalFileName: 'my_file.txt',
    }, 'the file handler should have the correct data');
    assert.equal(file.getId(), 456, 'the file handler should have the correct id');
    assert.equal(file.getURL(), 'https://test.compass.education/Services/FileAssets.svc/DownloadFile?blah=blah', 'the file handler should have the correct url');
  });
  it('should download the file successfully', async function() {
    nockBase
        .get('/')
        .reply(200);
    const scope = nockBase
        .get('/Services/FileAssets.svc/DownloadFile?blah=blah')
        .matchHeader('cookie', 'cpssid_test=testToken123')
        .reply(200, 'Hello, world!', {
          'content-disposition': 'attachment;filename=my_file.txt',
          'content-type': 'text/plain',
        });
    const download = await file.download();
    scope.done();
    assert.equal(download.data, 'Hello, world!', 'the correct data should have been downloaded');
    assert.equal(download.name, 'my_file.txt', 'the correct name should have been given to the file');
    assert.equal(download.type, 'text/plain', 'the correct MIME type of the data should be specified');
  });
  it('should throw an error when the download isn\'t successful', async function() {
    nockBase
        .get('/')
        .reply(200);
    const scope = nockBase
        .get('/Services/FileAssets.svc/DownloadFile?blah=blah')
        .matchHeader('cookie', 'cpssid_test=testToken123')
        .reply(404);
    await assert.throwsAsync(async function() {
      await file.download();
    }, Error, 'Request failed with status code 404');
    scope.done();
  });
});
