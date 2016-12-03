'use strict';

const torrent  = require('./controllers/torrent.js');
const torrents = require('./controllers/torrents.js');

module.exports = function (app) {
  app.get('/', torrents.get);
  app.post('/torrent', torrents.addTorrent);
  app.post('/url', torrents.addTorrentUrl);

  app.get('/:hash([a-zA-Z0-9]{40})', torrent.get);
  app.post('/:hash([a-zA-Z0-9]{40})/pause', torrent.pause);
  app.post('/:hash([a-zA-Z0-9]{40})/start', torrent.start);
  app.post('/:hash([a-zA-Z0-9]{40})/ratio/:ratio([0-9]{1,4})', torrent.ratio);
  app.delete('/:hash([a-zA-Z0-9]{40})', torrent.remove);
};
