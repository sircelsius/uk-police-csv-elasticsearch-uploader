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
    log: 'debug'
  });
};

createIndex = function(index){
  return client.indices.create({
    index: index
  });
};

var checkIndexExists = function(index){
  return client.cat.health();
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
}

write = function(index, arr){
  _.each(arr, function(el){
    client.index({
      index: index,
      type: 'police_record',
      body: el
    }, function(){});
  });
};

writeBulk = function(index, arr){
  var body = [];
  
  _.each(arr, function(data){
    var month = data.Month ? parseInt(data.Month.substr(5, 6)) : 0;
    var year = data.Month ? parseInt(data.Month.substr(0, 4)) : 0;

    var lat = parseFloat(data.Latitude) ? parseFloat(data.Latitude) : 0;
    var lon = parseFloat(data.Longitude) ? parseFloat(data.Longitude) : 0; 

    var loc = {
      lat: lat,
      lon: lon
    };

    var el = {
      police_id: data['Crime ID'],
      month: month,
      year: year,
      reportedBy: data['Reported by'],
      fallsWithin: data['Falls within'],
      loc: loc,
      location: data['Location'],
      LSOACode: data['LSOA code'],
      LSOAName: data['LSOA name'],
      crimeType: data['Crime type'],
      outcome: data['Last outcome'] 
    };
    body.push({
      index: {
        _index: index,
        _type: 'police_record'
      }
    });
    body.push(el);
  });

  return client.bulk({
      body: body
    });
}

module.exports = {
  open: open,
  createIndex: createIndex,
  putMapping: putMapping,
  write: write,
  writeBulk: writeBulk
};