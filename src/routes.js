const torrent = require('./controllers/torrent.js');
const torrents = require('./controllers/torrents.js');
const storage = require('./controllers/storage');

const bodyParser = require('body-parser');

module.exports = function(app, multer) {
  app.get('/', torrents.get);
  app.post(
    '/torrent',
    multer.single('torrent'),
    bodyParser.text(),
    torrents.addTorrent,
  );
  app.post('/url', bodyParser.json(), torrents.addTorrentUrl);

  app.get('/:hash([a-zA-Z0-9]{40})', torrent.get);
  app.post('/:hash([a-zA-Z0-9]{40})/pause', torrent.pause);
  app.post('/:hash([a-zA-Z0-9]{40})/start', torrent.start);
  app.post('/:hash([a-zA-Z0-9]{40})/ratio/:ratio([0-9]{1,4})', torrent.ratio);
  app.delete('/:hash([a-zA-Z0-9]{40})', torrent.remove);

  app.get('/free', storage.getFree);
};
