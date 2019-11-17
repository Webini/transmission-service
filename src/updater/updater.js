const EventEmitter = require('events');
const defaultSyncTagGetter = require('./defaultSyncTagGetter.js');
const assert = require('assert');
const EVENTS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
};

function prepareChilds(rawObject, childsConf) {
  const promises = [];

  for (const field in childsConf) {
    const conf = childsConf[field];

    rawObject[conf.symbol] = new Updater(
      Object.assign({ parent: rawObject }, conf),
    );

    promises.push(rawObject[conf.symbol].init());
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
 * @param {String|Symbol} syncTagField
 */
function applySyncTag(object, syncTagGetter, syncTagField) {
  object[syncTagField] = syncTagGetter(object);
}

/**
 * Apply syncTags on object of object or array
 * @param {Object} objects
 * @param {Callback} syncTagGetter
 * @param {String|Symbol} syncTagField
 */
function applySyncTags(objects, syncTagGetter, syncTagField) {
  for (const i in objects) {
    applySyncTag(objects[i], syncTagGetter, syncTagField);
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

  for (const i in objects) {
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
   * @param {Callback} config.modelCreateCb Callback to create a new element, it will have the raw data received in update and the parent if available in parameters, and must return an es6 promise with the new data values
   * @param {Callback} config.modelDeleteCb Callback to delete an element, it will have the raw data of the last version of the element and the parent if available as parameters, and must return an es6 promise
   * @param {Callback} config.modelUpdateCb Callback to update an element, it will have the raw data of the reference element, the raw data of the new element and the parent if available, it must return an es6 promise with the new data values
   * @param {string|Symbol} [config.syncTagField=Symbol()] Key name where the syncTag will be save
   */
  constructor(config) {
    const {
      modelDataGetter,
      idField,
      syncTagGetter,
      childs,
      parent,
      modelCreateCb,
      modelDeleteCb,
      modelUpdateCb,
      syncTagField,
      emitter,
    } = Object.assign(
      {
        syncTagGetter: defaultSyncTagGetter,
        childs: {},
        idField: 'id',
        syncTagField: Symbol('syncTag'),
      },
      config,
    );

    assert(modelDataGetter, 'modelDataGetter is required to use Updater');
    assert(modelDeleteCb, 'modelDeleteCb is required to use Updater');
    assert(modelCreateCb, 'modelCreateCb is required to use Updater');
    assert(modelUpdateCb, 'modelUpdateCb is required to use Updater');

    this.emitter = emitter || new EventEmitter();
    this.syncTagGetter = syncTagGetter;
    this.syncTagField = syncTagField;
    this.childs = childs;
    this.idField = idField;
    this.modelDeleteCb = modelDeleteCb;
    this.modelCreateCb = modelCreateCb;
    this.modelUpdateCb = modelUpdateCb;
    this.modelDataGetter = modelDataGetter;
    this.initialized = false;
    this.parent = parent;
    this.objects = [];
    this.objectsIds = [];
    this.config = config;

    //init childs symbols
    for (const key in this.childs) {
      if (!this.childs[key].symbol) {
        this.childs[key].symbol = Symbol(key);
      }
    }
  }

  /**
   * Initialize the updater
   * @return {Promise}
   */
  init() {
    if (!this.initialized) {
      this.initialized = this.modelDataGetter(this.config, this.parent)
        .then(elements => {
          const ePromises = [];

          elements.forEach(element => {
            ePromises.push(this._create(element));
          });

          return Promise.all(ePromises);
        })
        .then(() => {
          this.objectsIds = extractIds(this.objects, this.idField);
          this.config = null;

          return this;
        });
    }

    return this.initialized;
  }

  /**
   * get all events types
   * @return {Object} key => name
   */
  static get EVENTS() {
    return EVENTS;
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
  async _updateElement(referenceElement, newElement) {
    const element = await this.modelUpdateCb(
      referenceElement,
      newElement,
      this.parent,
    );

    const promises = [];

    for (const key in this.childs) {
      const conf = this.childs[key];
      element[conf.symbol] = referenceElement[conf.symbol];

      promises.push(
        element[conf.symbol].update(element[key]).then(updater => {
          element[key] = updater.elements;
        }),
      );
    }

    applySyncTag(element, this.syncTagGetter, this.syncTagField);
    const offset = this.objects.indexOf(referenceElement);
    this.objects[offset] = element;

    await Promise.all(promises);

    this.emitter.emit(EVENTS.UPDATED, element, referenceElement);
    return this;
  }

  /**
   * delete an element
   * @param {Object} Element to delete from updater
   * @return {Promise}
   */
  async _deleteElement(element) {
    const promises = [];

    for (const key in this.childs) {
      const conf = this.childs[key];
      //delete all childs data
      promises.push(element[conf.symbol].update([]));
    }

    const offset = this.objects.indexOf(element);
    this.objects.splice(offset, 1);

    promises.push(this.modelDeleteCb(element, this.parent));

    await Promise.all(promises);
    this.emitter.emit(EVENTS.DELETED, element);
    return this;
  }

  async _create(element, dispatchEvent) {
    this.objects.push(element);
    await prepareChilds(element, this.childs); //create the childs updater
    const promises = [];

    applySyncTag(element, this.syncTagGetter, this.syncTagField);

    if (dispatchEvent) {
      this.emitter.emit(EVENTS.CREATED, element);
    }

    //update childs updater with provided data
    for (const key in this.childs) {
      const conf = this.childs[key];
      const updater = element[conf.symbol];

      if (!element[key]) {
        element[key] = updater.elements;
      } else {
        promises.push(
          element[conf.symbol].update(element[key]).then(updater => {
            element[key] = updater.elements;
          }),
        );
      }
    }

    return Promise.all(promises);
  }

  /**
   * Create a new element
   * @param {Object} rawElement
   * @return {Promise}
   */
  async _createElement(rawElement) {
    const element = await this.modelCreateCb(rawElement, this.parent);
    return this._create(element, true);
  }

  /**
   * Get one element by his id
   * @param {String} id Element id
   * @return {Object|null} null if not found
   */
  get(id) {
    let object = null;

    for (const i in this.objects) {
      const element = this.objects[i];
      if (getId(element, this.idField, false) === id) {
        object = element;
        break;
      }
    }

    return object;
  }

  async update(newElements) {
    if (!this.initialized) {
      await this.init();
    }

    newElements = newElements || [];

    // avant de commencer les updates() on doit impérativement avoir un retour de la DB
    // processing des syncTags
    applySyncTags(newElements, this.syncTagGetter, this.syncTagField);

    const toAdd = [];
    const done = [];
    const promises = [];

    for (const i in newElements) {
      const newElement = newElements[i];
      const id = getId(newElements[i], this.idField, false);
      let referenceElement = null;

      /**
       * newElement can be new if id is unset or if we haven't the element
       * in our array (in the case of third party id generation).
       * */

      if (id === null || (referenceElement = this.get(id)) === null) {
        toAdd.push(newElement);
        continue;
      }

      //check si notre syncTag a changé
      if (
        newElement[this.syncTagField] !== referenceElement[this.syncTagField]
      ) {
        promises.push(this._updateElement(referenceElement, newElement));
      }

      done.push(id);
    }

    const deletedElements = this.objectsIds.filter(
      id => done.indexOf(id) === -1,
    );

    deletedElements.forEach(id => {
      const element = this.get(id);
      promises.push(this._deleteElement(element));
    });

    toAdd.forEach(element => {
      promises.push(this._createElement(element));
    });

    await Promise.all(promises);
    this.objectsIds = extractIds(this.objects, this.idField);

    return this;
  }

  get elements() {
    return this.objects;
  }
}

module.exports = Updater;
