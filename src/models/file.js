'use strict';
module.exports = function(sequelize, DataTypes) {
  const File = sequelize.define('File', {
    id: {
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      type: DataTypes.UUID
    },
    torrentHash: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'Torrents', key: 'hash' },
      onDelete: 'cascade'
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    bytesCompleted: {
      type: DataTypes.BIGINT.UNSIGNED,
      defaultValue: 0,
      allowNull: false
    },
    length: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    priority: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1,
      allowNull: false
    },
    position: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false
    },
    wanted: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
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