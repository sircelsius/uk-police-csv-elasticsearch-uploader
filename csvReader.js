'use strict';

var csv = require('fast-csv'),
  fs = require('fs'),
  elasticsearch = require('elasticsearch'),
  _ = require('underscore');

var client = elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

exports.read = function(fileName) {
  // client.indices.create({
  //   index: 'uk_police_data'
  // })
  // .then(function(response){
  //   client.indices.putMapping({
  //     index: 'uk_police_data',
  //     type: 'police_record',
  //     body: {
  //       properties: {
  //         loc: {
  //           type: 'geo_point'
  //         }
  //       }
  //     }
  //   })
  // })

  csv
    .fromPath(fileName, {
      headers: true
    })
    .on('data', function(data) {

      var month = data.Month ? parseInt(data.Month.substr(5, 6)) : 0;
      var year = data.Month ? parseInt(data.Month.substr(0, 4)) : 0;

      var lat = parseFloat(data.Latitude) ? parseFloat(data.Latitude) : 0;
      var lon = parseFloat(data.Longitude) ? parseFloat(data.Longitude) : 0; 

      var loc = {
        lat: lat,
        lon: lon
      };

      var res = {
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
      }

      client.create({
        index: 'uk_police_data',
        type: 'police_record',
        body : res
      })
      .then(function(response) {
        console.log("ES response:" + response);
      })
    })
    .on('end', function() {
      console.log('done');
    })
}