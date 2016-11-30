/*global describe,it*/
'use strict';

const defaultSyncTagGetter = require('../src/updater/defaultSyncTagGetter.js');
const assert               = require('assert');

describe('defaultSyncTagGetter', () => {
  it('should return updatedAt', () => {
    const testObject = { updatedAt: new Date() };
    assert.strictEqual(defaultSyncTagGetter(testObject), testObject.updatedAt);
  });

  it('should return customId', () => {
    const testObject = { customId: 42 };
    this.idName = 'customId';
    this.defaultSyncTagGetter = defaultSyncTagGetter;

    assert.strictEqual(this.defaultSyncTagGetter(testObject), testObject.customId);
  });

  it('should throw exception', () => {
    assert.throws(() => {
      defaultSyncTagGetter({});
    });
  });

});