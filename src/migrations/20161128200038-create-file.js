'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Files', {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID
      },
      torrentHash: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'Torrents', key: 'hash' },
        onDelete: 'cascade'
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      bytesCompleted: {
        type: Sequelize.BIGINT.UNSIGNED,
        defaultValue: 0,
        allowNull: false
      },
      length: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false
      },
      priority: {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 1,
        allowNull: false
      },
      position: {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0,
        allowNull: false
      },
      wanted: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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