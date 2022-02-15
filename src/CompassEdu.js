'use strict';

const test = '';
const axios = require('axios');
const { validate } = require('bycontract');
const { CompassEduAuth } = require('./CompassEduAuth');
const { CompassEduFileHandler } = require('./CompassEduFileHandler');

/** CompassEdu class. */
class CompassEdu {

  /**
   * The base URL used for requests.
   * @returns {String} - The base URL used for requests.
   */
  getBaseURL() {
    return this.#auth.getBaseURL();
  }

  /**
   * The CompassEduAuth object.
   * @private
   * @type {CompassEduAuth}
   */
  #auth = null;

  /**
   * The CompassEduAuth object.
   * @type {CompassEduAuth}
   * @readonly
   */
  get auth() {
    return this.#auth;
  }

  /**
   * See {@tutorial gettingstarted}.
   * Create a CompassEdu object.
   * @param {string} url - The base URL for the school-specific Compass website without the trailing slash.
   */
  constructor(url) {
    validate(arguments, ['string']);
    this.#auth = new CompassEduAuth(url);
  }

  /**
   * @typedef  {Object}   CompassEdu~Location
   * @property {Number}   id            - The ID of the location.
   * @property {Boolean}  archived      - Whether the location is archived or not.
   * @property {String}   building      - The name of the major building that the location is within.
   * @property {String}   description   - A brief description of the location.
   * @property {String}   name          - The name of the location.
   * @property {String}   longName      - The long name of the location that includes its name and the building it is within.
   */

  /**
   * Get all locations
   * @return {Array.<CompassEdu~Location>} - Array of locations.
   */
  async getAllLocations() {
    try {
      const res = await axios.request({
        url: '/Services/ReferenceDataCache.svc/GetAllLocations?sessionstate=readonly',
        baseURL: this.getBaseURL(),
        method: 'get',
        maxRedirects: 0,
        validateStatus(status) {
          return status === 200;
        },
      });
      const locations = [];
      // Reorder the data so it makes more sense.
      res.data.d.forEach((item, index) => {
        locations[index] = {
          id: item.id,
          archived: item.archived,
          building: item.building,
          description: item.longName,
          name: item.n,
          longName: item.roomName,
        };
      });
      return locations;
    } catch (e) {
      throw e;
    }
  }

  /**
   * @typedef  {Object} CompassEdu~ChronicleRatings
   * @property {String}       name        - The name of the rating.
   * @property {String}       description - A description of the rating.
   * @property {Number}       enumValue   - A number that represents the rating.
   * @property {?Number}      group       - The group that the rating is part of.
   */

  /**
   * Get available chronicle ratings
   * @return {Array.<CompassEdu~ChronicleRatings>} - Array of objects. All the locations at the school.
   */
  async getChronicleRatings() {
    try {
      const res = await axios.request({
        url: '/Services/ReferenceDataCache.svc/GetChronicleRatings',
        baseURL: this.getBaseURL(),
        method: 'get',
        maxRedirects: 0,
        validateStatus(status) {
          return status === 200;
        },
      });
      const ratings = [];
      res.data.d.forEach((item, index) => {
        ratings[index] = {
          name: item.name,
          description: item.description,
          enumValue: item.enumValue,
          group: item.group,
        };
      });
      return ratings;
    } catch (e) {
      throw e;
    }
  }

  /**
   * @typedef {Object}    CompassEdu~NewsItem
   * @property {Number}   id              - ID of the news feed item.
   * @property {String}   title           - The title of the news feed item
   * @property {String}   content         - The content formatted in HTML
   * @property {Date}     postDate        - A date object of when the news feed item was posted.
   * @property {Date}     emailSentDate   - A date object of when the news feed item email was sent.
   * @property {Date}     start           - A date object of when the news feed item should begin appearing on the Compass dashboard.
   * @property {Date}     end             - A date object of when the news feed item should stop appearing on the Compass dashboard.
   * @property {Boolean}  createdByAdmin  - Whether the news item was created by an admin.
   * @property {Boolean}  locked          - Whether the news item is locked.
   * @property {CompassEdu~NewsItemCustomGroupTargets}    customGroupTargets  - Custom group targets.
   * @property {Array.<CompassEdu~NewsItemGroupTargets>}  groupTargets        - Array of group targets.
   * @property {CompassEdu~User}                          sender              - The user that posted the news feed item.
   * @property {Array.<CompassEdu~FileAsset>}             attachments         - An array of files that were attached to the news feed item.
   * @property {Boolean}  priority        - Whether the news feed item is a priority.
   * @property {Boolean}  publicWebsite   - Whether the news feed item should be shown publicly.
   * @property {Boolean}  publishToLinkedSchools  - Whether the news feed item should be published to linked schools.
   * @property {Boolean}  publishToTalkingPoints  - Whether the news feed item should be published to talking points.
   * @property {Boolean}  showImagesFullScreen    - Whether images should be shown in full screen.
   * @property {String}   startFinishString       - A string showing the period of time the news feed item will appear for.
   * @property {Array.<String>} talkingPointsTags - Talking points tags.
   */

  /**
   * @typedef  {Object}      CompassEdu~NewsItemCustomGroupTargets
   * @property {Array.<Number>} campusIds      - An array of target campuses' IDs.
   * @property {Array.<Number>} customGroupIds - An array of target custom groups' IDs.
   */

  /**
   * @typedef  {Object}       CompassEdu~NewsItemGroupTargets
   * @property {Array.<Number>} activityIds     - An array of target activities' IDs.
   * @property {Number}         baseRole        - An integer that represents the base role that can see the notification.
   * @property {Array.<Number>} campusIds       - An array of target campuses' IDs.
   * @property {Array.<Number>} formGroups      - An array of target forms' IDs.
   * @property {Boolean}        future
   * @property {Array.<Number>} houses          - An array of target houses' IDs.
   * @property {Array.<Number>} userIds         - An array of target users' IDs.
   * @property {Array.<Number>} yearLevels      - An array of target year levels.
   */

  /**
   * @typedef  {Object}   CompassEdu~User
   * @property {Number}   userId        - The ID of the user.
   * @property {String}   userName      - The name of the user.
   * @property {String}   userImageUrl  - A URL of the user's icon image.
   */

  /**
   * Get newsfeed items
   * @param {Number} activityId The ID of the activity.
   * @param {Number} [since]    Which Newsfeed item should we start at. This trims the newsfeed items to the id specified. Useful for finding only latest newsfeed items.
   * @param {Number} [limit=10] Limit to amount of items.
   * @param {Number} [start=0]  Which item to start at.
   * @return {Array.<CompassEdu~NewsItem>}  Returns an array of objects.
   */
  async getNewsFeedItemsByActivityId(activityId, since=null, limit=10, start=0) {
    validate(arguments, [
      'number',
      'number=',
      'number=',
      'number=',
    ]);
    if (await this.#auth._checkAuth() !== true) throw new Error('Unable to obtain valid authorisation header');
    try {
      const res = await axios.request({
        url: '/Services/NewsFeed.svc/GetActivityNewsFeedPaged?sessionstate=readonly',
        baseURL: this.getBaseURL(),
        method: 'post',
        maxRedirects: 0,
        validateStatus(status) {
          return status === 200;
        },
        headers: {
          cookie: this.#auth._getAuthHeader(),
        },
        data: {
          activityId: activityId,
          limit: limit,
          start: start,
        },
      });
      const data = (since !== null) ? res.data.d.data.slice(Object.keys(res.data.d.data).find((key) => res.data.d.data[key].NewsItemId === since)+1) : res.data.d.data;
      const returnData = [];
      data.forEach((item, i) => {
        returnData[i] = {
          id: item.NewsItemId,
          title: item.Title,
          content: item.Content1,
          postDate: new Date(item.PostDateTime),
          emailSentDate: new Date(item.EmailSentDate),
          start: new Date(item.Start),
          end: new Date(item.End),
          createdByAdmin: item.CreatedByAdmin,
          locked: item.Locked,
          customGroupTargets: {
            campusIds: item.NewsItemCustomGroupTargets.CampusIds,
            customGroupIds: item.NewsItemCustomGroupTargets.CustomGroupIds,
          },
          groupTargets: (function(obj) {
            const arr = [];
            item.NewsItemGroupTargets.forEach((target, i) => {
              arr[i] = {
                activityIds: target.ActivityIds,
                baseRole: target.BaseRole,
                campusIds: target.CampusIds,
                formGroups: target.FormGroups,
                future: target.Future,
                houses: target.Houses,
                userIds: target.UserIds,
                yearLevels: target.YearLevels,
              };
            });
            return arr;
          })(this),
          sender: {
            userId: item.UserId,
            userName: item.UserName,
            userImageUrl: new URL(item.UserImageUrl, this.getBaseURL()).href,
          },
          attachments: (function(obj) {
            const arr = [];
            item.Attachments.forEach((a, i) => {
              arr[i] = new CompassEduFileHandler(
                  new URL(a.UiLink, obj.getBaseURL()).href,
                  obj.#auth,
                  {
                    id: a.AssetId,
                    fileAssetType: a.FileAssetType,
                    isImage: a.IsImage,
                    name: a.Name,
                    originalFileName: a.OriginalFileName,
                  },
              );
            });
            return arr;
          })(this),
        };
      });
      return returnData;
    } catch (e) {
      throw e;
    }
  }

}

module.exports.CompassEdu = CompassEdu;
