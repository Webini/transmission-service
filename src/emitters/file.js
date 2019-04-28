const UpdaterEvents = require('../updater/updater.js').EVENTS;
const EventEmitter = require('events');
const LOG_PREFIX = 'FileEmitter';
const diff = require('object-diff');
const bus = require('../bus.js');
const winston = require('winston');

const EVENTS = {
  CREATED: 'file.created',
  UPDATED: 'file.updated',
  DELETED: 'file.deleted',
  DOWNLOADED: 'file.downloaded',
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
      objectId: element.id,
    });
  }

  _processUpdated(newElement, oldElement) {
    const differences = diff(oldElement, newElement);

    this._emit(EVENTS.UPDATED, {
      date: new Date(),
      data: {
        old: oldElement,
        new: newElement,
        diff: differences,
      },
      type: EVENTS.UPDATED,
      objectId: newElement.id,
    });

    if (
      differences['bytesCompleted'] !== undefined &&
      oldElement['bytesCompleted'] < oldElement['length'] &&
      newElement['bytesCompleted'] >= newElement['length']
    ) {
      this._emit(EVENTS.DOWNLOADED, {
        date: new Date(),
        data: newElement,
        type: EVENTS.DOWNLOADED,
        objectId: newElement.id,
      });
    }
  }

  _processDeleted(element) {
    return this._emit(EVENTS.DELETED, {
      date: new Date(),
      data: element,
      type: EVENTS.DELETED,
      objectId: element.id,
    });
  }

  _emit(routingKey, event) {
    if (!bus) {
      super.emit(routingKey, event);
    } else {
      bus.publish(routingKey, event);
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
