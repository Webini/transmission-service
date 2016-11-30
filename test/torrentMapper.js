/*global describe,it*/
'use strict';

const torrentMapper = require('../src/worker/torrentMapper.js');
const assert        = require('assert');

describe('torrentMapper', () => {
  const testObject = { 
    name: 'Roger',
    hashString: 'abc',
    files: [
      { name: 'Test' },
      { name: 'Test 1' },
      { name: 'Test 2' }
    ],
    fileStats: [
      { size: 42 },
      { size: 128 },
      { size: 256 }
    ]
  };

  const testObjectSimple = {
    name: 'Patrice'
  };

  it('should merge correctly datas', () => {
    assert.deepStrictEqual(torrentMapper(testObject), {
      hash: 'abc',
      name: testObject.name,
      files: [
        { name: 'Test', size: 42 },
        { name: 'Test 1', size: 128 },
        { name: 'Test 2', size: 256 }
      ]
    });
  });

  it('should merge object without filesStat and files keys', () => {
    assert.deepStrictEqual(
      torrentMapper(testObjectSimple), 
      Object.assign({ 
        files: []
      }, testObjectSimple) //old school destructuring TMTC
    );
  });
});