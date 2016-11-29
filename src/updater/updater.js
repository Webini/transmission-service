'use strict';

const LOG_PREFIX           = 'UPDATER';
const winston              = require('winston');
const models               = require('../models/index.js');
const defaultSyncTagGetter = require('./defaultSyncTagGetter.js');

class Updater {
  create(
    { queryOptions, modelName, idName, syncTagGetter, childs} 
    = { syncTagGetter: defaultSyncTagGetter, idName: 'id', childs: {} }
  ) {
    this.model         = this.models[modelName];
    this.idName        = idName;
    this.syncTagGetter = syncTagGetter;
    this.childs        = childs;
    this.queryOptions  = queryOptions;

    if (!this.model) {
      throw new Error(`Cannot found model ${modelName}`);
    }

    this.objects = {
      //'objectId' => { object }
    };

    this.objectsTags = {
      //'lastSyncTag' => objectId
    };

    this.objectsIds = []; //array des ids de nos objets

    const promises = [];
    promises.push(
      models
        .findAll(this.queryOptions)
        .then((data) => {

        })
    );

    return Promise
             .all(promises)
             .then(() => this);
  }

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
  }

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

module.exports = new Updater();