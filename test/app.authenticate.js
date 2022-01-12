var compassedu = require('../')
  , app = new compassedu('https://test.compass.education')
  , chai = require('chai')
  , chaiNock = require('chai-nock')
  , assert = chai.assert
  , expect = chai.expect;
chai.use(chaiNock);
