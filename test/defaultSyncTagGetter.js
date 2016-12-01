/*global describe,it*/
'use strict';

const defaultSyncTagGetter = require('../src/updater/defaultSyncTagGetter.js');
const assert               = require('assert');

describe('defaultSyncTagGetter', () => {
  it('should return updatedAt', () => {
    const testObject = { updatedAt: new Date() };
    assert.strictEqual(defaultSyncTagGetter(testObject), testObject.updatedAt);
  });

  it('should throw exception', () => {
    assert.throws(() => {
      defaultSyncTagGetter({});
    });
  });

});