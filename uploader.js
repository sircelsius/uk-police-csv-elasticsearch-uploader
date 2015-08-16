'use strict';

var program = require('commander'),
  reader = require('./utils/csvReader.js'),
  // writer = require('utils/esWriter'),
  winston = require('winston');

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
  filename: './logs/uploader.log',
  logstash: true
});

winston.remove(winston.transports.Console);

winston.add(winston.transports.Console, {
  colorize: true
});

winston.info('--------------------------'
  + '\nUK Police data uploader'
  + '\n-----------------------'
  + '\nRunning with options:'
  + '\nFile:\t' + filename
  + '\nHost:\t' + host
  + '\nPort:\t' + port);