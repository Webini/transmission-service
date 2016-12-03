'use strict';

/**
 * create a new model updater 
 * @param {Sequelize.Model} model
 * @param {String} idField Model id field
 * @param {Array[String]} preserveFields newElement fields to preserve after update
 * @return {Function}
 */
module.exports = function(model, idField = 'id', preserveFields = []) {
  /**
   * It should always return a promise 
   * @return {Promise}
   */
  return function(oldElement, newElement, parent) {
    const id = oldElement[idField];
    
    if (id === null || id === undefined) {
      return Promise.reject(new Error(`Id ${idField} not found`));
    }

    return model.update(newElement, { 
      where: {
        [idField]: oldElement[idField],
      }
    }).then(() => {
      const output = Object.assign({}, oldElement);

      for (const key in output) {
        if (newElement[key] !== undefined) {
          output[key] = newElement[key];
        }
      }

      preserveFields.forEach((field) => {
        output[field] = newElement[field];
      });

      return output;
    });
  };
};

/**
 * 
  return function(oldElement, newElement, parent) {
    const id = oldElement[idField];
    
    if (id === null || id === undefined) {
      return Promise.reject(new Error(`Id ${idField} not found`));
    }

    return model
      .findById(oldElement[idField])
      .then((element) => element.update(newElement))
      .then((element) => {
        const output = element.toJSON();
        
        preserveFields.forEach((field) => {
          output[field] = newElement[field];
        });

        return output;
      });
  };
 */