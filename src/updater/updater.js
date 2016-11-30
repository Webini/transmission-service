'use strict';

const defaultSyncTagGetter = require('./defaultSyncTagGetter.js');
const assert               = require('assert');

function prepareChilds(rawObject, childsConf) {
  const promises = [];

  for(const field in childsConf) {
    const conf = childsConf[field];
    rawObject[field] = new Updater();
    
    promises.push(
      rawObject[field].create(
        Object.assign({ parent: rawObject }, conf)
      )
    );
  }

  return Promise.all(promises);
} 

class Updater {
  /**
   * @param {Object} config Configuration object
   * @param {String} [config.idField=id] Name of the id field of the data array retreived by config.modelDataGetter
   * @param {Function} config.modelDataGetter Method that give the first revision of the data array ( two default getters are available in this directory allDataGetter.js and oneToManyGetter.js )
   * @param {Function} [config.syncTagGetter=defaultSyncTagGetter] Method that will generate syncTag for element of the data array
   * @param {Object} config.childs Associative object with key = field name of an item in data array and value = this config object, it will allow us to make recursive diff
   * @param {Object} config.parent Used internally for providing parent to modelDataGetter
   * @todo Rajouter un callback pour créer une entité qui serait ajoutée via le update
   * @return {Promise}
   */
  create(config) {
    const { modelDataGetter, idField, syncTagGetter, childs, parent } = Object.assign({ 
      syncTagGetter: defaultSyncTagGetter, 
      childs: {},
      idField: 'id'
    }, config);

    assert(modelDataGetter, 'modelDataGetter is required to use Updater');

    this.syncTagGetter = syncTagGetter;
    this.childs        = childs;
    this.idField       = idField;

    this.objects = {
      //'objectId' => { object }
    };

    this.objectsTags = {
      //'lastSyncTag' => objectId
    };

    this.objectsIds = []; //array des ids de nos objets

    const promises = [];
    promises.push(
      modelDataGetter(config, parent)
        .then((elements) => {
          const ePromises = [];

          elements.forEach((element) => {
            const id = element[idField];
            if (id === null || id === undefined) {
              ePromises.push(Promise.reject(`Cannot found id (${idField}) for element`));
              return;
            }

            this.objects[id] = element;
            ePromises.push(
              prepareChilds(element, childs)
            );
          });

          return Promise.all(ePromises);
        })
    );

    return Promise
             .all(promises)
             .then(() => this);
  }
/*
  static create(modelName, idName) {

    return models
              .findAll({ raw: true })
              .then((data) => {
                const objectsMap = {};
                
                data.forEach((item) => {
                  objectsMap[item[idName]] = item;
                  //& le oneToMany ?
                });

                return new Updater(objectsMap, model, idName);
              });
  }*/

  update(rawData) {
    // avant de commencer les updates() on doit impérativement avoir un retour de la DB

    //processing des syncTags
      //on en profile pour lister les IDs dispo
    //check en local si on trouve le syncTag dans this.objectsTags
    //si not found =>
      // on recherche l'objet via son id dans this.objects
      // si trouvé =>
        // on update son syncTag et on met a jour this.objectsTags
        // il faut créer l'entrée en DB 
        // réinit des updaters pour les childs
        // fire d'event update
      // si non trouvé =>
        // on ajoute l'object a this.objects, on ajoute le mapping dans this.objectsTags
        // et on rajoute l'id a this.objectsIds
        // fire d'event create
    //si found on se touche

    //now on fait une diff de l'array d'ids qu'on a fait plus haut en processant les syncTags
    //les elements en trop sont les torrents deletes
      // suppression dans this.objects, this.objectsIds, this.objectsTags et fire d'event
  }

}

module.exports = Updater;