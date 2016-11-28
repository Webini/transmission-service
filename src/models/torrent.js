'use strict';
module.exports = function(sequelize, DataTypes) {
  const Torrent = sequelize.define('Torrent', {
    hash: DataTypes.STRING(255),
    name: DataTypes.STRING(255),
    eta: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    error: DataTypes.INTEGER,
    errorString: DataTypes.STRING(1024),
    downloadDir: DataTypes.STRING(255),
    isFinished: DataTypes.BOOLEAN,
    isStalled: DataTypes.BOOLEAN,
    desiredAvailable: DataTypes.BIGINT.UNSIGNED,
    leftUntilDone: DataTypes.BIGINT.UNSIGNED,
    sizeWhenDone: DataTypes.BIGINT.UNSIGNED,
    totalSize: DataTypes.BIGINT.UNSIGNED,
    magnetLink: DataTypes.STRING(2048),
    uploadedEver: DataTypes.BIGINT,
    seedRatioLimit: DataTypes.INTEGER,
    seedRatioMode: DataTypes.INTEGER,
    uploadRatio: DataTypes.FLOAT,
    peersConnected: DataTypes.INTEGER.UNSIGNED,
    peersSendingToUs: DataTypes.INTEGER.UNSIGNED,
    peersGettingFromUs: DataTypes.INTEGER.UNSIGNED,
    rateDownload: DataTypes.INTEGER.UNSIGNED,
    rateUpload: DataTypes.INTEGER.UNSIGNED,
    activityDate: DataTypes.INTEGER.UNSIGNED,
    trackersJson: DataTypes.TEXT,
    trackers: DataTypes.VIRTUAL
  }, {
    classMethods: {
      associate: function(models) {    
        Torrent.hasMany(models.File, { 
          onDelete: 'cascade', 
          hooks: true,
          foreignKey: 'torrentId' 
        });
      }
    },
    getterMethods: {
      trackers: function(){
        try {
          return JSON.parse(this.trackersJson);
        } catch(e) {
          return [];
        }
      },
    }
  });
  return Torrent;
};