'use strict';

var program = require('commander'),
  reader = require('./utils/csvReader.js'),
  processor = require('./utils/processor.js'),
  writer = require('./utils/writer.js'),
  winston = require('winston'),
  q = require('q'),
  _ = require('underscore');

// PROGRAM OPTIONS PARSING
program
  .version('0.0.0')
  .option('-f, --filename [name]', 'Path to input file')
  .option('-h, --host [host]', 'ES host')
  .option('-p, --port [port]', 'ES port')
  .parse(process.argv);

var filename = program.filename? program.filename :null,
  host = program.host ? program.host : 'localhost',
  port = program.port ? program.port : '9200';

// LOGGING
winston.add(winston.transports.File, {
  filename: './logs/uploader-info.log',
  level: 'debug',
  logstash: true
});

// winston.add(winston.transports.File, {
//   filename: './logs/uploader-debug.log',
//   level: 'debug',
//   logstash: true
// });

winston.remove(winston.transports.Console);

winston.add(winston.transports.Console, {
  colorize: true
});

winston.info('--------------------------' +
  '\nUK Police data uploader' +
  '\n-----------------------' +
  '\nRunning with options:' +
  '\nFile:\t' + filename +
  '\nHost:\t' + host + 
  '\nPort:\t' + port);

writer.open(host, port);

var uploadForfile = function(input){
  var arr = [];
  reader.readCSV(input, arr)
  .then(function() {
    winston.info('Extracted ' + arr.length + ' entries from ' + input);
  },
  function(err){
    winston.error('Unable to extract data from ' + input);
  })
  .then(function() {
    processor.process(arr)
  })
  .then(function(){
    writer.createIndex('uk_police_data_test')
    .then(
      function(success){
        winston.info('Created index uk_police_data_test.');
      },
      function(error){
        winston.info('Couldn\'t create index uk_police_data_test.');
      }
    )
    .then(
      function(){
        writer.putMapping('uk_police_data_test')
          .then(function() {
            writer.writeBulk('uk_police_data_test', arr);
          })
          .done();
      }
    );
  })
  .done();
}

if(filename != null) {
  uploadForfile(filename);
}
else {
  var glob = require('glob');

  winston.info('No filename provider, recursively indexing all files within resources dir');
  var res = [];

  glob('./resources/**/*.csv', function(err, files){
    winston.info('Found ' + _.size(files) + ' files to upload.');
    _.each(files, function(file){
      reader.readCSV(file, res)
      .then(function() {
        winston.info('Extracted ' + res.length + ' entries from files');
      },
      function(err){
        winston.error('Unable to extract data from files');
      })
      .then(function() {
        processor.process(res)
      })
      .then(function(){
        writer.createIndex('uk_police_data_test')
        .then(
          function(success){
            winston.info('Created index uk_police_data_test.');
          },
          function(error){
            winston.info('Couldn\'t create index uk_police_data_test.');
          }
        )
        .then(
          function(){
            writer.putMapping('uk_police_data_test')
              .then(function() {
                writer.writeBulk('uk_police_data_test', res);
              })
              .done();
          }
        );
      })
      .done();
    })
  });
}