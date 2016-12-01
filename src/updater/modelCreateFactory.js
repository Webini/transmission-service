'use strict';

/**
 * create a new model creator 
 * @param {Sequelize.Model} model
 * @param {Array[String]} preserveFields rawElement fields to preserve after creation
 * @return {Function}
 */
module.exports = function(model, preserveFields = []) {
  /**
   * It should always return a promise 
   * @return {Promise}
   */
  return function(rawElement, rawParent) {
    return model
      .create(rawElement)
      .then((element) => {
        const output = element.toJSON();

        preserveFields.forEach((field) => {
          output[field] = rawElement[field];
        });

        return output;
      });
  };
};