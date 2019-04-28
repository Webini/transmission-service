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
  // eslint-disable-next-line
  return (conf, rawParent) =>
    model.findAll().then(elements => elements.map(element => element.toJSON()));
};
