'use strict';

var q = require('q'),
  _ = require('underscore'),
  winston = require('winston');

var process,
  extractRecordFromCSV;
  
process = function(arr){
  winston.info('PROCESSOR - Started processing ' + _.size(arr) + ' entries.');
  var d = q.defer();

  var target = [];

  q.all(
    _.map(arr, function(el, index){
      var d1 = q.defer();
      winston.debug('PROCESSOR - Current(' + index + ') element ID: ' + el['Crime ID']);
      var data = extractRecordFromCSV(el);
      winston.debug('PROCESSOR - Current data: ' + JSON.stringify(data));
      target.push(data);
      d1.resolve(target);
      return d1.promise;
    })
  )
  .then(function() {
    winston.info('PROCESSOR - Processed ' + _.size(target) + ' entries.');
    d.resolve(target);
  });

  return d.promise;
};

extractRecordFromCSV = function(data) {
  var month = data.Month ? parseInt(data.Month.substr(5, 6)) : 0;
  var year = data.Month ? parseInt(data.Month.substr(0, 4)) : 0;

  var lat = parseFloat(data.Latitude) ? parseFloat(data.Latitude) : 0;
  var lon = parseFloat(data.Longitude) ? parseFloat(data.Longitude) : 0; 

  var loc = {
    lat: lat,
    lon: lon
  };

  return {
    police_id: data['Crime ID'],
    month: month,
    year: year,
    reportedBy: data['Reported by'],
    fallsWithin: data['Falls within'],
    loc: loc,
    location: data.Location,
    LSOACode: data['LSOA code'],
    LSOAName: data['LSOA name'],
    crimeType: data['Crime type'],
    outcome: data['Last outcome'] 
  };
};

module.exports = {
  process: process
};