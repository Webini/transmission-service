'use strict';

const transmission = require('../transmission/api.js');
const updater      = require('../updater.js');
const winston      = require('winston');
const LOG_PREFIX   = 'TORRENT_CTRL';

module.exports = {
  get: function(req, res, next) {
    const torrent = updater.get(req.params.hash);
    if (torrent === null) {
      res.status(404).send();
    } else {
      res.json(updater.get(req.params.hash));  
    }
  },
  pause: function(req, res, next) {
    transmission
      .stopAsync([ req.params.hash ])
      .then(() => res.json(true))
      .catch((err) => {
        winston.error(LOG_PREFIX, err);
        res.status(500).send();
      });
  },
  start: function(req, res, next) {
    transmission
      .startAsync([ req.params.hash ])
      .then(() => res.json(true))
      .catch((err) => {
        winston.error(LOG_PREFIX, err);
        res.status(500).send();
      });
  },
  ratio: function(req, res, next) {
    transmission
      .setAsync(
        [ req.params.hash ],
        {
          seedRatioLimit: req.params.ratio,
          seedRatioMode: 1
        }
      )
      .then(() => res.json(true))
      .catch((err) => {
        winston.error(LOG_PREFIX, err);
        res.status(500).send();
      });
  },
  remove: function(req, res, next) {
    transmission
      .removeAsync([ req.params.hash ], true)
      .then(() => res.json(true))
      .catch((err) => {
        winston.error(LOG_PREFIX, err);
        res.status(500).send();
      });
  }
};