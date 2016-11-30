'use strict';

/**
 * creater model getter
 * @param {Sequelize.Model} model
 * @param {String} parentIdColumn
 * @param {String} childIdColumn
 * @return {Function}
 */
module.exports = function(model, parentIdColumn, childIdColumn) {
  /**
   * It should always return a promise 
   * @return {Promise}
   */
  return function(conf, rawParent) {
    if (!rawParent) {
      return Promise.reject('This getter cannot work without parent');
    }

    const parentId = rawParent[parentIdColumn];
    if (parentId === null || parentId === undefined) {
      return Promise.reject('This getter cannot work without parentId defined');
    }

    return model.findAll({ 
      where: { [childIdColumn]: parentId },
      raw: true
    });
  };
};