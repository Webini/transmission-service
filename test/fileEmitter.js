/*global describe,it*/

const FileEmitter = require('../src/emitters/file.js');
const Updater = require('../src/updater/updater.js');
const assert = require('assert');

describe('FileEmitter', () => {
  const newFile = {
    id: 1337,
    name: 'test',
    bytesCompleted: 59342,
    length: 99999,
  };
  const updatedFile = {
    id: 1337,
    name: 'test updated',
    bytesCompleted: 95000,
    length: 99999,
  };
  const finishedFile = {
    id: 1337,
    name: 'test',
    bytesCompleted: 99999,
    length: 99999,
  };

  it('should fire created event', done => {
    const emitter = new FileEmitter();
    emitter.on(FileEmitter.EVENTS.CREATED, evt => {
      assert.deepStrictEqual(evt, {
        date: evt.date,
        type: FileEmitter.EVENTS.CREATED,
        objectId: newFile.id,
        data: newFile,
      });
      done();
    });
    emitter.emit(Updater.EVENTS.CREATED, newFile);
  });

  it('should fire updated event', done => {
    const emitter = new FileEmitter();
    emitter.on(FileEmitter.EVENTS.UPDATED, evt => {
      assert.deepStrictEqual(evt, {
        date: evt.date,
        type: FileEmitter.EVENTS.UPDATED,
        objectId: newFile.id,
        data: {
          old: newFile,
          new: updatedFile,
          diff: {
            name: updatedFile.name,
            bytesCompleted: updatedFile.bytesCompleted,
          },
        },
      });
      done();
    });
    emitter.emit(Updater.EVENTS.UPDATED, updatedFile, newFile);
  });

  it('should fire downloaded event', done => {
    const emitter = new FileEmitter();
    emitter.on(FileEmitter.EVENTS.DOWNLOADED, evt => {
      assert.deepStrictEqual(evt, {
        date: evt.date,
        type: FileEmitter.EVENTS.DOWNLOADED,
        objectId: newFile.id,
        data: finishedFile,
      });
      done();
    });
    emitter.emit(Updater.EVENTS.UPDATED, finishedFile, newFile);
  });

  it('should fire deleted event', done => {
    const emitter = new FileEmitter();
    emitter.on(FileEmitter.EVENTS.DELETED, evt => {
      assert.deepStrictEqual(evt, {
        date: evt.date,
        type: FileEmitter.EVENTS.DELETED,
        objectId: newFile.id,
        data: newFile,
      });
      done();
    });
    emitter.emit(Updater.EVENTS.DELETED, newFile);
  });
});
