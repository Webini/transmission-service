/*global describe,it*/

const TorrentEmitter = require('../src/emitters/torrent.js');
const Updater = require('../src/updater/updater.js');
const assert = require('assert');

describe('TorrentEmitter', () => {
  const newTorrent = {
    hash: 1337,
    name: 'test',
    leftUntilDone: 59342,
    length: 99999,
  };
  const updatedTorrent = {
    hash: 1337,
    name: 'test updated',
    leftUntilDone: 50000,
  };
  const finishedTorrent = {
    hash: 1337,
    name: 'test',
    leftUntilDone: 0,
  };

  it('should fire created event', done => {
    const emitter = new TorrentEmitter();
    emitter.on(TorrentEmitter.EVENTS.CREATED, evt => {
      assert.deepStrictEqual(evt, {
        date: evt.date,
        type: TorrentEmitter.EVENTS.CREATED,
        objectId: newTorrent.hash,
        data: newTorrent,
        domain: null,
      });
      done();
    });
    emitter.emit(Updater.EVENTS.CREATED, newTorrent);
  });

  it('should fire updated event', done => {
    const emitter = new TorrentEmitter();
    emitter.on(TorrentEmitter.EVENTS.UPDATED, evt => {
      assert.deepStrictEqual(evt, {
        date: evt.date,
        type: TorrentEmitter.EVENTS.UPDATED,
        objectId: newTorrent.hash,
        data: {
          old: newTorrent,
          new: updatedTorrent,
          diff: {
            name: updatedTorrent.name,
            leftUntilDone: updatedTorrent.leftUntilDone,
          },
        },
        domain: null,
      });
      done();
    });
    emitter.emit(Updater.EVENTS.UPDATED, updatedTorrent, newTorrent);
  });

  it('should fire downloaded event', done => {
    const emitter = new TorrentEmitter();
    emitter.on(TorrentEmitter.EVENTS.DOWNLOADED, evt => {
      assert.deepStrictEqual(evt, {
        date: evt.date,
        type: TorrentEmitter.EVENTS.DOWNLOADED,
        objectId: newTorrent.hash,
        data: finishedTorrent,
        domain: null,
      });
      done();
    });
    emitter.emit(Updater.EVENTS.UPDATED, finishedTorrent, newTorrent);
  });

  it('should fire deleted event', done => {
    const emitter = new TorrentEmitter();
    emitter.on(TorrentEmitter.EVENTS.DELETED, evt => {
      assert.deepStrictEqual(evt, {
        date: evt.date,
        type: TorrentEmitter.EVENTS.DELETED,
        objectId: newTorrent.hash,
        data: newTorrent,
        domain: null,
      });
      done();
    });
    emitter.emit(Updater.EVENTS.DELETED, newTorrent);
  });
});
