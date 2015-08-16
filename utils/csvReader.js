'use strict';

var csv = require('fast-csv');

var readCSV;

readCSV = function(fileName){
  return csv.fromPath(fileName, {
    headers: true
  });
}

module.exports = {
  readCSV: readCSV
}