'use strict';

const transmission = require('../transmission/api.js');
const updater      = require('../updater.js');
const LOG_PREFIX   = 'TorrentsController';

module.exports = {
  get: function(req, res){
    res.apiSuccess(updater.elements);  
  },
  addTorrent: function(req, res) {
    const contentType = req.headers['content-type'];
    let promise       = null;
    
    if (contentType && contentType.toLowerCase() === 'text/plain' && req.body.length > 0) {
      promise = transmission.addBase64Async(req.body);
    } else if (req.file) {
      promise = transmission.addFileAsync(req.file.path);
    }

    if (promise) {
      promise
        .then((data) => res.apiSuccess(data))
        .catch((err) => res.apiError(LOG_PREFIX, 'Invalid torrent', err));
    } else {
      res.apiError(LOG_PREFIX, 'Torrent data not found');
    }   
  },
  addTorrentUrl: function(req, res) {
    if (!req.body.url) {
      res.apiError(LOG_PREFIX, 'Parameter missing');
      return;
    }

    transmission
      .addUrlAsync(req.body.url)
      .then((data) => res.apiSuccess(data))
      .catch((err) => res.apiError(LOG_PREFIX, 'Invalid url', err));
  }
};