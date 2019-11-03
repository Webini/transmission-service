const UpdaterEvents = require('../updater/updater.js').EVENTS;
const EventEmitter = require('events');
const LOG_PREFIX = 'TorrentEmitter';
const diff = require('object-diff');
const winston = require('winston');
const torrentQueue = require('../queues/torrent');

const IGNORED_FIELDS = ['trackers', 'files'];
const DOMAIN = process.env.DOMAIN || null;

const EVENTS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  DOWNLOADED: 'downloaded',
};

class TorrentEmitter extends EventEmitter {
  static get EVENTS() {
    return EVENTS;
  }

  _processCreated(element) {
    return this._emit(EVENTS.CREATED, {
      date: new Date(),
      data: element,
      type: EVENTS.CREATED,
      objectId: element.hash,
      domain: DOMAIN,
    });
  }

  _processUpdated(newElement, oldElement) {
    const differences = diff(oldElement, newElement);
    for (const field in differences) {
      if (IGNORED_FIELDS.indexOf(field) >= 0) {
        delete differences[field];
      }
    }

    this._emit(EVENTS.UPDATED, {
      date: new Date(),
      data: {
        old: oldElement,
        new: newElement,
        diff: differences,
      },
      type: EVENTS.UPDATED,
      objectId: newElement.hash,
      domain: DOMAIN,
    });

    if (
      differences['leftUntilDone'] !== undefined &&
      oldElement['leftUntilDone'] > 0 &&
      newElement['leftUntilDone'] === 0
    ) {
      this._emit(EVENTS.DOWNLOADED, {
        date: new Date(),
        data: newElement,
        type: EVENTS.DOWNLOADED,
        objectId: newElement.hash,
        domain: DOMAIN,
      });
    }
  }

  _processDeleted(element) {
    return this._emit(EVENTS.DELETED, {
      date: new Date(),
      data: element,
      type: EVENTS.DELETED,
      objectId: element.hash,
      domain: DOMAIN,
    });
  }

  _emit(routingKey, event) {
    if (!torrentQueue) {
      super.emit(routingKey, event);
    } else {
      torrentQueue.add(routingKey, event);
    }
  }

  emit(eventName, ...args) {
    switch (eventName) {
      case UpdaterEvents.CREATED:
        return this._processCreated.apply(this, args);

      case UpdaterEvents.UPDATED:
        return this._processUpdated.apply(this, args);

      case UpdaterEvents.DELETED:
        return this._processDeleted.apply(this, args);

      default:
        winston.log(LOG_PREFIX, {
          msg: 'Event not found',
          type: eventName,
          args: args,
        });
    }
  }
}

module.exports = TorrentEmitter;
