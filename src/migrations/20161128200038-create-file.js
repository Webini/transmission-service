'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Files', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      torrentId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'Torrents', key: 'id' },
        onDelete: 'cascade'
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      bytesCompleted: {
        type: Sequelize.BIGINT.UNSIGNED,
        default: 0,
        allowNull: false
      },
      length: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false
      },
      position: {
        type: Sequelize.INTEGER.UNSIGNED,
        default: 0,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    },{
      'charset': 'utf8',
      'collate': 'utf8_general_ci'
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Files');
  }
};