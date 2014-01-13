'use strict';

var
  path               = require('path'),
  nock               = require('nock'),
  chai               = require('chai'),
  expect             = chai.expect,
  chaiJSONSchema     = require('chai-json-schema'),
  removeFolderSchema = require(path.join(__dirname, 'schema/removeFolder.js')),
  errorSchema        = require(path.join(__dirname, 'schema/error.js')),
  BtSync             = require('../lib/bittorrent-sync')
;

chai.use(chaiJSONSchema);

var btsync = new BtSync();

// Since we do not want to call any API for real we disable all real HTTP requests
nock.disableNetConnect();

describe('removeFolder', function() {

  before(function(done) {
    nock('http://localhost:8888')
      .get('/api?method=remove_folder')
      .replyWithFile(200, __dirname + '/mock/remove_folder-missing-parameters.json');
    done();
  });

  it('must return an error if there is some missing parameters', function(done) {
    btsync.removeFolder(function(err, result) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.match(/Specify all the required parameters/);
      expect(result).to.be.jsonSchema(errorSchema);
      return done();
    });
  });

  before(function(done) {
    nock('http://localhost:8888')
      .get('/api?method=remove_folder&secret=UNKNOWN')
      .replyWithFile(200, __dirname + '/mock/remove_folder-invalid-secret.json');
    done();
  });

  it('must return an error if the specified secret is invalid', function(done) {
    btsync.removeFolder({
      secret: 'UNKNOWN'
    }, function(err, result) {
      expect(err).to.be.instanceof(Error);
      expect(result).to.be.jsonSchema(removeFolderSchema);
      return done();
    });
  });

  before(function(done) {
    nock('http://localhost:8888')
      .get('/api?method=remove_folder&secret=ADB16DFRPFO7DHKOY56XQD83S55L5JBU2')
      .replyWithFile(200, __dirname + '/mock/remove_folder.json');
    done();
  });

  it('must return a successful response if everything is ok', function(done) {
    btsync.removeFolder({
      secret: 'ADB16DFRPFO7DHKOY56XQD83S55L5JBU2'
    }, function(err, result) {
      expect(err).to.equal(null);
      expect(result).to.be.jsonSchema(removeFolderSchema);
      return done();
    });
  });

  after(function(done) {
    nock.cleanAll();
    done();
  });

});
