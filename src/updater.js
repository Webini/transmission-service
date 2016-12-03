'user strict';

const models                 = require('./models/index.js');
const Updater                = require('./updater/updater.js');
const oneToManyGetterFactory = require('./updater/oneToManyGetter.js');
const allDataGetterFactory   = require('./updater/allDataGetter.js');
const modelDeleteFactory     = require('./updater/modelDeleteFactory.js');
const modelCreateFactory     = require('./updater/modelCreateFactory.js');
const modelUpdateFactory     = require('./updater/modelUpdateFactory.js');
const crc32                  = require('crc').crc32;
const EventEmitter           = require('events');

const torrentEmitter = new EventEmitter();
const filesEmitter   = new EventEmitter();
/*
torrentEmitter.on(Updater.EVENTS.CREATED, (element) => {
  console.log(`Torrent ${element.name} created #${element.hash}`);
});
torrentEmitter.on(Updater.EVENTS.UPDATED, (element) => {
  console.log(`Torrent ${element.name} updated #${element.hash}`);
});
torrentEmitter.on(Updater.EVENTS.DELETED, (element) => {
  console.log(`Torrent ${element.name} deleted #${element.hash}`);
});
filesEmitter.on(Updater.EVENTS.CREATED, (element) => {
  console.log(`File ${element.name} created #${element.id}`);
});
filesEmitter.on(Updater.EVENTS.UPDATED, (element) => {
  console.log(`File ${element.name} updated #${element.id}`);
});
filesEmitter.on(Updater.EVENTS.DELETED, (element) => {
  console.log(`File ${element.name} deleted #${element.id}`);
});
*/
module.exports = new Updater({
  emitter: torrentEmitter,
  modelDataGetter: allDataGetterFactory(models.Torrent),
  modelCreateCb: modelCreateFactory(models.Torrent, [ 'files' ]),
  modelDeleteCb: modelDeleteFactory(models.Torrent, 'hash'),
  modelUpdateCb: modelUpdateFactory(models.Torrent, 'hash', [ 'files' ]),
  idField: 'hash',
  childs: {
    files: {
      emitter: filesEmitter,
      idField: 'name',
      modelDataGetter: oneToManyGetterFactory(models.File, 'hash', 'torrentHash'),
      modelCreateCb: function(rawElement, rawParent) {
        return models.File
          .create(Object.assign({ torrentHash: rawParent.hash }, rawElement))
          .then((element) => element.toJSON());
      },
      modelUpdateCb: modelUpdateFactory(models.File),
      modelDeleteCb: modelDeleteFactory(models.File),
      syncTagGetter: function(el) {
        return el.bytesCompleted;
      }
    }
  },
  syncTagGetter: function(torrent) {
    return crc32(torrent.hash + torrent.status +
                 torrent.leftUntilDone + torrent.error + 
                 torrent.peersSendingToUs + torrent.peersGettingFromUs +
                 torrent.rateDownload + torrent.rateUpload + torrent.eta +
                 torrent.activityDate + torrent.isFinished + torrent.seedRatioLimit);
  }
});