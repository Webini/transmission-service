'user strict';

const models                 = require('./models/index.js');
const Updater                = require('./updater/updater.js');
const oneToManyGetterFactory = require('./updater/oneToManyGetter.js');
const allDataGetterFactory   = require('./updater/allDataGetter.js');
const modelDeleteFactory     = require('./updater/modelDeleteFactory.js');
const modelCreateFactory     = require('./updater/modelCreateFactory.js');
const modelUpdateFactory     = require('./updater/modelUpdateFactory.js');
const crc32                  = require('crc').crc32;
const TorrentEmitter         = require('./emitters/torrent.js');
const FileEmitter            = require('./emitters/file.js');

const torrentEmitter = new TorrentEmitter();
const filesEmitter   = new FileEmitter();

torrentEmitter.on(TorrentEmitter.EVENTS.CREATED, (event) => {
  console.log(`Torrent ${event.data.name} created #${event.objectId}`);
});/*
torrentEmitter.on(TorrentEmitter.EVENTS.UPDATED, (event) => {
  console.log(`Torrent ${event.data.new.name} updated #${event.objectId}`);
});*/
torrentEmitter.on(TorrentEmitter.EVENTS.DOWNLOADED, (event) => {
  console.log(`Torrent ${event.data.name} downloaded #${event.objectId}`);
});
torrentEmitter.on(TorrentEmitter.EVENTS.DELETED, (event) => {
  console.log(`Torrent ${event.data.name} deleted #${event.objectId}`);
});

filesEmitter.on(FileEmitter.EVENTS.CREATED, (event) => {
  console.log(`File ${event.data.name} created #${event.objectId}`);
});/*
filesEmitter.on(FileEmitter.EVENTS.UPDATED, (event) => {
  console.log(`File ${event.data.new.name} updated #${event.objectId}`);
});*/
filesEmitter.on(FileEmitter.EVENTS.DELETED, (event) => {
  console.log(`File ${event.data.name} deleted #${event.objectId}`);
});
filesEmitter.on(FileEmitter.EVENTS.DOWNLOADED, (event) => {
  console.log(`File ${event.data.name} downloaded #${event.objectId}`);
});

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