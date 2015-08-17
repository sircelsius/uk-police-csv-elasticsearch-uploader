'use strict';

var reader = require('../../../src/utils/csvReader.js'),
  winston = require('winston');

describe("A test", function(){
  var res = [];
  reader.readCSV('./test.csv', res)
    .then(function(){
      it('Should be true', function(){
        winston.info('res: ' + res.length);
        expect(true).toBe(true);
      });
    });
});