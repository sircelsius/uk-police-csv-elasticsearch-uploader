'use strict';

var fast = require('fast-csv'),
  q = require('q'),
  winston = require('winston'),
  fs = require('graceful-fs'),
  _ = require('underscore');

var readCSV;

/**
 * Read a csv file, export the data to a target variable
 * @param  {String} fileName Path to the file to read
 * @param  {Array} target   Array of parsed elements
 * @return {promise}        
 */
readCSV = function(fileName, target){
  winston.info('READER - Reading (async) CSV: ' + fileName);
  var d = q.defer();

  var stream = fs.createReadStream(fileName);

  var csvStream = fast
    .parse({
      headers: true
    })
    .on('data', function(data){
      target.push(data);
    })
    .on('end', function(){
      winston.info('READER - Extracted ' + _.size(target) + ' raw entries from ' + fileName + '.');
      stream.destroy();
      d.resolve(target);
    });

    stream.pipe(csvStream);

    return d.promise;
};

module.exports = {
  readCSV: readCSV
};