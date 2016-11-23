const torrent  = require('./controllers/torrent.js');
const torrents = require('./controllers/torrents.js');

module.exports = function(app) {
    app.get('/', torrents.get);
};