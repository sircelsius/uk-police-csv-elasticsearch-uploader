'use strict';

var q = require('q'),
  _ = require('underscore'),
  winston = require('winston'),
  elasticsearch = require('elasticsearch');

var client,
  open,
  createIndex,
  putMapping,
  write,
  writeBulk;

open = function(host, port){
  client = new elasticsearch.Client({
    host: host + ':' + port,
    log: 'info'
  });
};

createIndex = function(index){
  return client.indices.create({
    index: index
  });
};

putMapping = function(index){
  return client.indices.putMapping({
    index: index,
    type: 'police_record',
    body: {
      'properties': {
        'loc': {
          'type': 'geo_point'
        }
      }
    }
  });
};

write = function(index, type, arr){
  winston.info('WRITER - Received ' + _.size(arr) + ' processed entries to write to ' + index);
  var d = q.defer();

  q.all(_.map(arr, function(el){
    return client.index({
        index: index,
        type: 'police_record',
        body: el
      })
      .then(function(success){
        winston.info('WRITER - Wrote entry: ' + success);
      });
    })
  )
  .then(function(data){
    winston.info('WRITER - Wrote entries.');
    d.resolve(data);
  })
  .done();

  return d.promise;
};

writeBulk = function(index, type, arr){
  var d = q.defer();
  var body = [];
  
  q.all(
    _.map(arr, function(el){
      var d1 = q.defer();
      body.push({
        index: {
          _index: index,
          _type: type
        }
      });
      body.push(el);
      d1.resolve(body);
      return d1.promise;
    })
  )
  .then(function() {
    winston.info('WRITER - Started bulk indexing of ' + _.size(arr) + ' entries');
    return client.bulk({
      body: body
    });
  })
  .then(function() {
    winston.info('WRITER - Done bulk writing ' + _.size(arr) + ' entries.');
    d.resolve(arr);
    body = null;
    arr = null;
  })
  .done();

  return d.promise;
};

module.exports = {
  open: open,
  createIndex: createIndex,
  putMapping: putMapping,
  write: write,
  writeBulk: writeBulk
};