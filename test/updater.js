/*global describe,it,before,beforeEach,afterEach*/
'use strict';

const oneToManyGetterFactory = require('../src/updater/oneToManyGetter.js');
const allDataGetterFactory   = require('../src/updater/allDataGetter.js');
const modelDeleteFactory     = require('../src/updater/modelDeleteFactory.js');
const modelCreateFactory     = require('../src/updater/modelCreateFactory.js');
const modelUpdateFactory     = require('../src/updater/modelUpdateFactory.js');
const models  = require('../src/models/index.js'); 
const data    = require('./resources/data.json');
const Updater = require('../src/updater/updater.js');
const path    = require('path');
const Umzug   = require('umzug');
const umzug   = new Umzug({
  storage: 'none',
  migrations: {
    params:  [  models.sequelize.getQueryInterface(), models.Sequelize ],
    path: path.join(__dirname, '../src/migrations') 
  }
});
const mustHave = function(elements, compare, field, cb) {
  let found = 0;
  const mustFound = elements.length;

  for(const i in compare) {
    const offset = elements.indexOf(compare[i][field]);
    if (offset >= 0) {
      elements.splice(offset, 1);
      found++;
    }
  }
  
  if (elements.length <= 0 && mustFound == found) { 
    cb();
  } else {
    cb('Received incorrect data');
  }
};

describe('Updater', () => {
  before(() => {
    return umzug.up();
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

  describe('oneToManyGetter.js', () => {
    it('should reject promise because parent unavailable', (done) => {
      const oneToManyGetter = oneToManyGetterFactory(models.File, 'hash', 'torrentHash');
      oneToManyGetter(null, null)
        .then(() => { done('Result returned'); })
        .catch(() => done());
    });

    it('should reject promise because parent id is undefined', (done) => {
      const oneToManyGetter = oneToManyGetterFactory(models.File, 'hash', 'torrentHash');
      oneToManyGetter(null, { hash: null })
        .then(() => { done('Result returned'); })
        .catch(() => done());
    });

    it('should find torrent files', (done) => {
      const oneToManyGetter = oneToManyGetterFactory(models.File, 'hash', 'torrentHash');
      oneToManyGetter(null, { hash: 'aca11112456d83cf9a92048b93d06c4a3d873ce5' })
        .then((data) => { 
          mustHave([ 'File 1.png', 'File 2.txt' ], data, 'name', done);
        })
        .catch(done);
    });
  });
  

  describe('create', () => {
    const torrentsHashes = [ 'aca11111456d83cf9a92048b93d06c4a3d873ce5', 'aca11112456d83cf9a92048b93d06c4a3d873ce5' ]; 
    const torrentsFiles  = {
      'aca11111456d83cf9a92048b93d06c4a3d873ce5': [ 'selfie.png', 'selfish.txt' ],
      'aca11112456d83cf9a92048b93d06c4a3d873ce5': [ 'File 1.png', 'File 2.txt' ]
    };
    const torrentGetter  = allDataGetterFactory(models.Torrent);
    const filesGetter    = oneToManyGetterFactory(models.File, 'hash', 'torrentHash');
    

    it('should not be able to found id column', (done) => {
      const updater = new Updater();
      updater.create({
        modelDataGetter: torrentGetter,
        idField: 'torrentHash'
      })
      .then(() => { done('Results found'); })
      .catch(() => done());
    });

    it('should be able to retreive all model datas', (done) => {
      const updater = new Updater();
      updater.create({
        modelDataGetter: torrentGetter,
        idField: 'hash'
      }).then((updater) => {
        mustHave(torrentsHashes, updater.objects, 'hash', done);
      }).catch(done);
    });

    it.only('should be able to retreive all model datas and oneToMany fields', (done) => {
      const updater = new Updater();
      updater.create({
        modelDataGetter: torrentGetter,
        //these database shit are potentially death bottleneck
        modelCreateCb: modelCreateFactory(models.Torrent),
        modelDeleteCb: modelDeleteFactory(models.Torrent, 'hash'),
        modelUpdateCb: modelUpdateFactory(models.Torrent, 'hash', [ 'files' ]),
        idField: 'hash',
        childs: {
          files: {
            idField: 'name',
            modelDataGetter: filesGetter,
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
        }
      }).then((updater) => {
        return updater.update([{
          "hash":"aca11112456d83cf9a92048b93d06c4a3d873ce5",
          "files":[  
            {  
                "bytesCompleted":15,
                "length":175718,
                "name":"File 1.png"
            },
          ],
          "updatedAt": "0000-00-00 00:00:00"
        }]);
      }).then((updater) => {
        const torrents = updater.elements;
        console.log('Torrents => ', require('util').inspect(torrents, { showHidden: true, depth: 10 }));
        mustHave(torrentsHashes, torrents, 'hash', (err) => {
          if (!err) {
            let successfull = 0;
            let count = 0;

            for (const hash in torrents) {
              count++;
              const torrent = torrents[hash];
              
              mustHave(torrentsFiles[hash], torrent.files.elements, 'name', (err) => {
                if (!err) {
                  successfull++;
                }
              });
            }

            if (successfull === count) {
              return done();
            }
          } 

          done('Invalid data');
        });
      }).catch(done);
    });
  });

  afterEach(() => {
    return models.Torrent.truncate();
  });

});