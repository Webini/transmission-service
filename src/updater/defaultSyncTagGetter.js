'use strict';

module.exports = function(item) {
  if (item['updatedAt']) {
    return item['updatedAt'];
  } else {
    throw new Error('Cannot generate sync tag ! No column updatedAt found.');
  }
};