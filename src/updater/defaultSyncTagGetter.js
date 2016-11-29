'use strict';

module.exports = function(item) {
  if (item['updatedAt']) {
    return item['updatedAt'];
  } else if(this.idName && item[this.idName]) {
    return item[this.idName];
  } else {
    throw new Error('Cannot generate sync tag ! No column name found.');
  }
};