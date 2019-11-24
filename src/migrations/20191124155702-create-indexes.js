module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addIndex('Files', [ 'id' ]);
    await queryInterface.addIndex('Files', [ 'torrentHash' ]);
    await queryInterface.addIndex('Torrents', [ 'hash' ]);
  },
  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Files', [ 'id' ]);
    await queryInterface.removeIndex('Files', [ 'torrentHash' ]);
    await queryInterface.removeIndex('Torrents', [ 'hash' ]);
  },
};
