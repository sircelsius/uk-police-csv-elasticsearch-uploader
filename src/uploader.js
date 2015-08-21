'use strict';

var program = require('commander'),
  reader = require('./utils/reader.js'),
  processor = require('./utils/processor.js'),
  writer = require('./utils/writer.js'),
  winston = require('winston'),
  q = require('q'),
  _ = require('underscore'),
  fs = require('fs');

// PROGRAM OPTIONS PARSING
program
  .version('0.0.0')
  .option('-f, --filename [name]', 'Path to input file')
  .option('-h, --host [host]', 'ES host')
  .option('-p, --port [port]', 'ES port')
  .parse(process.argv);

var filename = program.filename ? program.filename :null,
  host = program.host ? program.host : 'localhost',
  port = program.port ? program.port : '9200';

var uploadForfile = function(input){
  var arr = [];
  return reader.readCSV(input, arr)
    .then(function(data) {
      return processor.process(data);
    },
    function(err) {
      winston.error('UPLOADER - Unable to read CSV ' + input + ': ' + err);
    })
    .then(function(data1) {
      winston.info('UPLOADER - Sending ' + _.size(data1) + ' entries to writer.');
      return writer.writeBulk('uk_police_data_test', 'police_report', data1);
    })
    .then(function(){
      winston.info('UPLOADER - Done uploading ' + _.size(arr) + ' entries.');
      arr = null;
      winston.info('UPLOADER - Memory cleared for ' + input);
    });
};

var timestamp = fs._toUnixTimestamp(new Date()).toString(),
  timestamp_truncate = timestamp.substring(0, timestamp.indexOf('.')),
  logger_name = './logs/uploader-' + timestamp_truncate + '.log';


// LOGGING
winston.add(winston.transports.File, {
  filename: logger_name,
  level: 'debug',
  logstash: true
});

winston.info('LOGGING TO: ' + logger_name);

winston.info('\n--------------------------' +
  '\nUK Police data uploader' +
  '\n--------------------------' +
  '\nRunning with options:' +
  '\nFile:\t' + filename +
  '\nHost:\t' + host + 
  '\nPort:\t' + port + '\n\n');

writer.open(host, port);

if(filename !== null) {
  uploadForfile(filename)
    .done();
}
else {
  var glob = require('glob');

  winston.info('No filename provided, recursively indexing all files within resources dir');

  glob('./resources/**/*.csv', function(err, files){
    winston.info('UPLOADER - Found ' + _.size(files) + ' files to upload.');
    q.all(
      _.map(files, function(el, index){
        winston.info('UPLOADER  - Starting upload of file ' + index + ' - ' + el);
        return uploadForfile(el);
      })
    )
    .then(function(){
      winston.info('UPLOADER - Done Bulk uploading for ' + _.size(files) + ' files.');
    })
    .done();
  });
}