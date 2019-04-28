const Promise = require('bluebird');
const Transmission = require('transmission');

Transmission.prototype.methods.torrents.fields = [
  /*'activityDate', 'addedDate', 'bandwidthPriority', 'comment', 'corruptEver', 
  'creator', 'dateCreated', 'desiredAvailable', 'doneDate', 'downloadDir', 
  'downloadedEver', 'downloadLimit', 'downloadLimited', 'error', 'errorString', 
  'eta', 'files', 'fileStats', 'hashString', 'haveUnchecked', 'haveValid', 
  'honorsSessionLimits', 'id', 'isFinished', 'isPrivate', 'leftUntilDone', 
  'magnetLink', 'manualAnnounceTime', 'maxConnectedPeers', 'metadataPercentComplete', 
  'name', 'peer-limit', 'peers', 'peersConnected', 'peersFrom', 'peersGettingFromUs', 
  'peersKnown', 'peersSendingToUs', 'percentDone', 'pieces', 'pieceCount', 
  'pieceSize', 'priorities', 'rateDownload', 'rateUpload', 'recheckProgress', 
  'seedIdleLimit', 'seedIdleMode', 'seedRatioLimit', 'seedRatioMode', 'sizeWhenDone',
  'startDate', 'status', 'trackers', 'trackerStats', 'totalSize', 'torrentFile', 
  'uploadedEver', 'uploadLimit', 'uploadLimited', 'uploadRatio', 'wanted', 
  'webseeds', 'webseedsSendingToUs' */
  'trackers',
  'hashString',
  'name',
  'eta',
  'status',
  'error',
  'errorString',
  'downloadDir',
  'isFinished',
  'isStalled',
  'desiredAvailable',
  'leftUntilDone',
  'sizeWhenDone',
  'totalSize',
  'magnetLink',
  'uploadedEver',
  'seedRatioLimit',
  'seedRatioMode',
  'uploadRatio',
  'peersConnected',
  'peersSendingToUs',
  'peersGettingFromUs',
  'rateDownload',
  'rateUpload',
  'activityDate',
  'files',
  'fileStats',
];

function create(config) {
  return Promise.promisifyAll(new Transmission(config));
}

const instance = create({
  host: process.env.TRANSMISSION_HOST,
  port: process.env.TRANSMISSION_PORT,
  username: process.env.TRANSMISSION_USER,
  password: process.env.TRANSMISSION_PASSWORD,
  url: process.env.TRANSMISSION_URL,
});

instance.create = create;

module.exports = instance;
