'use strict';

/**
 * creater model getter
 * @param {Sequelize.Model} model
 * @return {Function}
 */
module.exports = function(model) {
  /**
   * It should always return a promise 
   * @return {Promise}
   */
  return function(conf, rawParent) {
    return model.findAll({ raw: true });
  };
};