'use strict';

var csv = require('fast-csv'),
  q = require('q'),
  winston = require('winston'),
  fs = require('graceful-fs');

var readCSV;

readCSV = function(fileName, target){
  winston.info('Reading CSV: ' + fileName);
  var d = q.defer();

  var stream = fs.createReadStream(fileName);

  var csvStream = csv
    .parse({
      headers: true
    })
    .on('data', function(data){
      target.push(data);
    })
    .on('end', function(){
      winston.info('Done reading ' + target.length + ' entries in file ' + fileName);
      stream.destroy();
      d.resolve();
    });

    stream.pipe(csvStream);

    return d.promise;
};

module.exports = {
  readCSV: readCSV
};