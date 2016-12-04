'use strict';

const transmission = require('../transmission/api.js');
const updater      = require('../updater.js');
const LOG_PREFIX   = 'TorrentController';

module.exports = {
  get: function(req, res) {
    const torrent = updater.get(req.params.hash);
    if (torrent === null) {
      res.apiError(LOG_PREFIX, 'Resource not found', null, 404);
    } else {
      res.apiSuccess(updater.get(req.params.hash));  
    }
  },
  pause: function(req, res) {
    transmission
      .stopAsync([ req.params.hash ])
      .then(() => res.apiSuccess(true))
      .catch((err) => res.apiError(LOG_PREFIX, 'Unknown error', err));
  },
  start: function(req, res) {
    transmission
      .startAsync([ req.params.hash ])
      .then(() => res.apiSuccess(true))
      .catch((err) => res.apiError(LOG_PREFIX, 'Unknown error', err));
  },
  ratio: function(req, res) {
    transmission
      .setAsync(
        [ req.params.hash ],
        {
          seedRatioLimit: req.params.ratio,
          seedRatioMode: 1
        }
      )
      .then(() => res.apiSuccess(true))
      .catch((err) => res.apiError(LOG_PREFIX, 'Unknown error', err));
  },
  remove: function(req, res) {
    transmission
      .removeAsync([ req.params.hash ], true)
      .then(() => res.json(true))
      .catch((err) => res.apiError(LOG_PREFIX, 'Unknown error', err));
  }
};