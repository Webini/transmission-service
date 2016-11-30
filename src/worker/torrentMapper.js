/**
 * Be careful this will modify torrentData object.
 * This will merge file field
 * @param {object} torrentData
 * @return {object}
 */
module.exports = function(torrentData) {
  const fileStats = torrentData.fileStats;
  const filesData = torrentData.files;
  torrentData.hash = torrentData.hashString;

  delete torrentData.hashString;
  delete torrentData.fileStats;
  delete torrentData.files;
  
  torrentData.files = [];

  if (filesData instanceof Array && fileStats instanceof Array) {
    torrentData.files = filesData.map((file, i) => {
      return Object.assign(fileStats[i], file);
    });
  }

  return torrentData;
};