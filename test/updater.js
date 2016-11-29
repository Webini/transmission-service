/*global describe,it,beforeEach,afterEach*/
'use strict';

const models  = require('../src/models/index.js'); 
const data    = require('./resources/data.json');
const Updater = require('../src/updater/updater.js');

describe('Updater', () => {
  before(() => {
    return models.sequelize
                 .sync({ force: true });
  });

  beforeEach(() => {
    const promises = [];
    data.forEach((torrent) => {
      promises.push(
        models
          .Torrent
          .create(torrent)
          .then((model) => {
            const fprom = [];
            torrent.files.forEach((file) => {
              fprom.push(model.createFile(file));
            });
            return Promise.all(fprom);
          })
      );
    });

    return Promise.all(promises);
  });


  afterEach(() => {
    return models.Torrent.truncate();
  });

});