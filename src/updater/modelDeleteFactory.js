'use strict';

/**
 * Create a new model deletor 
 * @param {Sequelize.Model} model
 * @return {Function}
 */
module.exports = function(model, idField = 'id') {
  /**
   * It should always return a promise 
   * @return {Promise}
   */
  return function(rawElement, rawParent) {
    const id = rawElement[idField];

    if (id === null || id === undefined) {
      return Promise.reject(new Error(`Id ${idField} not found`));
    }

    return model
      .findById(id)
      .then((elem) => {
        return elem.destroy();
      });
  };
};