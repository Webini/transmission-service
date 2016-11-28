'use strict';
module.exports = function(sequelize, DataTypes) {
  const File = sequelize.define('File', {
    name: DataTypes.TEXT,
    bytesCompleted: DataTypes.BIGINT.UNSIGNED,
    length: DataTypes.BIGINT.UNSIGNED,
    position: DataTypes.INTEGER.UNSIGNED
  }, {
    classMethods: {
      associate: function(models) {
        File.belongsTo(models.Torrent, {
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return File;
};