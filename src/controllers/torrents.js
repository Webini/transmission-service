'use strict';

const updater = require('../updater.js');

module.exports = {
  get: function(req, res, next){
    res.json(updater.elements);  
  },
  addTorrent: function(req, res, next) {  
  },
  addTorrentUrl: function(req, res, next) {

  }
};