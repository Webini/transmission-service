'use strict';

const defaultSyncTagGetter = require('./defaultSyncTagGetter.js');
const assert               = require('assert');
const syncTagSymbol        = Symbol('syncTag');

function prepareChilds(rawObject, childsConf) {
  const promises = [];

  for(const field in childsConf) {
    const conf = childsConf[field];
    rawObject[conf.symbol] = new Updater();
    
    promises.push(
      rawObject[conf.symbol].create(
        Object.assign({ parent: rawObject }, conf)
      ).then((updater) => {
        rawObject[field] = updater.elements;
      })
    );
  }

  return Promise.all(promises);
} 

/**
 * Extract id from object
 * @param {Object} object
 * @param {String} idField
 * @param {Boolean} [thrown=true] true if the method should throw error
 * @return {any}
 */
function getId(object, idField, thrown = true) {
  const id = object[idField];

  if (id === null || id === undefined) {
    if (thrown) {
      throw new Error(`Undefined field ${idField}`);
    } else {
      return null;
    }
  }

  return id;
}

/**
 * Apply syncTags on object 
 * @param {Object} object 
 * @param {Callback} syncTagGetter
 */
function applySyncTag(object, syncTagGetter) {
  object[syncTagSymbol] = syncTagGetter(object); 
}

/**
 * Apply syncTags on object of object or array
 * @param {Object} objects 
 * @param {Callback} syncTagGetter
 */
function applySyncTags(objects, syncTagGetter) {
  for(const i in objects) {
    applySyncTag(objects[i], syncTagGetter);
  }
}

/**
 * Exctract ids from objects
 * @param {Object|Array} objects Objects containing ids
 * @param {String} idField Name of the id field
 * @return {Array}
 */
function extractIds(objects, idField) {
  const ids = [];

  for(const i in objects) {
    ids.push(getId(objects[i], idField));
  }

  return ids;
}

class Updater {
  /**
   * @param {Object} config Configuration object
   * @param {String} [config.idField=id] Name of the id field of the elements array retreived by config.modelDataGetter
   * @param {Callback} config.modelDataGetter Method that give the first revision of the elemnts array ( two default getters are available in this directory allDataGetter.js and oneToManyGetter.js )
   * @param {Callback} [config.syncTagGetter=defaultSyncTagGetter] Method that will generate syncTag for element of the elemnts array
   * @param {Object} config.childs Associative object with key = field name of an item in elements array and value = this config object, it will allow us to make recursive diff
   * @param {Object} config.parent Used internally for providing parent to modelDataGetter
   * @param {Array} [config.preserveFields=[]] Fields to preserve from original element
   * @param {Callback} modelCreateCb Callback to create a new element, it will have the raw data received in update and the parent if available in parameters, and must return an es6 promise with the new data values
   * @param {Callback} modelDeleteCb Callback to delete an element, it will have the raw data of the last version of the element and the parent if available as parameters, and must return an es6 promise
   * @param {Callback} modelUpdateCb Callback to update an element, it will have the raw data of the reference element, the raw data of the new element and the parent if available, it must return an es6 promise with the new data values
   * @todo Rajouter un callback pour créer une entité qui serait ajoutée via le update
   * @return {Promise}
   */
  create(config) {
    const { 
      modelDataGetter, idField, syncTagGetter, 
      childs, parent, preserveFields, modelCreateCb,
      modelDeleteCb, modelUpdateCb
    } = Object.assign({ 
      syncTagGetter: defaultSyncTagGetter, 
      childs: {},
      idField: 'id',
      preserveFields: []
    }, config);

    assert(modelDataGetter, 'modelDataGetter is required to use Updater');
    assert(modelDeleteCb, 'modelDeleteCb is required to use Updater');
    assert(modelCreateCb, 'modelCreateCb is required to use Updater');
    assert(modelUpdateCb, 'modelUpdateCb is required to use Updater');

    this.syncTagGetter  = syncTagGetter;
    this.childs         = childs;
    this.idField        = idField;
    this.preserveFields = preserveFields;
    this.modelDeleteCb  = modelDeleteCb;
    this.modelCreateCb  = modelCreateCb;
    this.parent         = parent;
    this.objects        = { /* 'objectId' => { object } */ };
    this.objectsIds     = []; //array des ids de nos objets

    //init childs symbols
    for (const key in this.childs) {
      if (!this.childs[key].symbol) {
        this.childs[key].symbol = Symbol(key);
      }
    }

    return modelDataGetter(config, this.parent)
      .then((elements) => {
        const ePromises = [];

        elements.forEach((element) => {
          const id = getId(element, idField);

          this.objects[id] = element;
          ePromises.push(
            prepareChilds(element, childs)
          );
        });

        return Promise.all(ePromises);
      })
      .then(() => {
        applySyncTags(this.objects, this.syncTagGetter);
        this.objectsIds = extractIds(this.objects, this.idField);

        return this; 
      });
  }

  /**
   * Mutate newElement to become the next referenceElement
   * it will synchronously transform newElement into referenceElement
   * by duplicating pointer of Updater found in referenceElement,
   * it's safe to play with this newElement since it always be in a valid state
   * the promise will fire a success when the update of all the newElement tree
   * is finished
   * @param {Object} referenceElement
   * @param {Object} newElement
   * @return {Promise}
   */
  _updateElement(referenceElement, newElement) {
    return this.modelUpdateCb(referenceElement, newElement, this.parent)
      .then((element) => {
        const promises = [];
        
        for (const key in this.childs) {
          const conf = this.childs[key];
          element[conf.symbol] = referenceElement[conf.symbol];
          promises.push(element[conf.symbol].update(element[key]));
        }

        this.objects[getId(referenceElement, this.idField)] = element;
        return Promise.all(promises);
      });
    //@todo fire event
  }

  /**
   * delete an element
   * @param {Object} Element to delete from updater
   * @return {Promise}
   */
  _deleteElement(element) {
    const promises = [];

    for (const key in this.childs) {
      const conf = this.childs[key];
      //delete all childs data
      element[conf.symbol].update([]);
    }

    delete this.objects[getId(element, this.idField)];
    promises.push(this.modelDeleteCb(element, this.parent));

    return Promise.all(promises);
  }

  /**
   * Create a new element
   * @param {Object} rawElement
   * @return {Promise}
   */
  _create(rawElement) {
    return this.modelCreateCb(rawElement, this.parent)
      .then((element) => {
        const id = getId(element, this.idField);
        this.objects[id] = element;

        return prepareChilds(element, this.childs) //create the childs updater
          .then(() => {
            const promises = [];

            //update childs updater with provided data
            for (const key in this.childs) {
              const conf = this.childs[key];
              promises.push(
                element[conf.symbol].update(element[key])
              );
            }

            applySyncTag(element, this.syncTagGetter);
            return Promise.all(promises);
          });
      });
  }

  update(newElements) {
    // avant de commencer les updates() on doit impérativement avoir un retour de la DB
    return new Promise((resolve) => {
      //processing des syncTags
      applySyncTags(newElements, this.syncTagGetter);
      //list les IDs dispo
      const rawIds   = extractIds(newElements);
      const toAdd    = [];
      const done     = [];
      const promises = [];

      for(const i in newElements) {
        const newElement = newElements[i];
        const id         = getId(newElements[i], this.idField, false);
        //newElement can really be new if id is unset or if we haven't the element
        //in our array (in the case of third party id generation). 
        if (id === null || !this.objects[id]) {
          toAdd.push(newElement);
          continue;
        }

        const referenceElement = this.objects[id];

        //check si notre syncTag a changé 
        if (newElement[syncTagSymbol] !== referenceElement[syncTagSymbol]) {
          promises.push(this._updateElement(referenceElement, newElement));
          done.push(id);
        }
      }

      const deletedElements = this.objectsIds.filter((id) => {
        return (done.indexof(id) === -1);
      });

      deletedElements.forEach((id) => {
        const element = this.objects[id];
        promises.push(this._deleteElement(element));
      });

      toAdd.forEach((element) => {
        promises.push(this._create(element));
      });

      this.objectsIds = rawIds;
      resolve(Promise.all(promises));
    });
  }

  get elements() {
    return this.objects;
  }
}

module.exports = Updater;