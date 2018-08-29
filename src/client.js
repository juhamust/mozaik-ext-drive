'use strict'

require('isomorphic-fetch');
const chalk = require('chalk');
const drive = require('./drive');
const config = require('./config');

/**
 * @param {Mozaik} mozaik
 */
const client = mozaik => {
  mozaik.loadApiConfig(config);

  const syncFiles = () => {
    const keyFilePath = config.get('drive.keyFilePath');
    // Allow passing the Drive client via mozaik (for testing purposes)
    const clientGetter = mozaik.loadDriveClient || new drive.Drive;
    mozaik.logger.info(chalk.yellow(`[drive] syncing files using ${keyFilePath}`));

    const progress = clientGetter(keyFilePath)
    .getFileNames()
    .then(fileNames => {
      return fileNames.map(file => {
        return driveClient.getFileStream(file.id)
        .then(fileStream => {
          return driveClient.writeFileStream(fileStream);
        });
      })
    });

    return Promise.all(progress);
  };

  const apiCalls = {
    sync() {
      return syncFiles()
      .then(() => {
        mozaik.logger.info('Synced files')
      })
      .catch(err => {
        mozaik.logger.error(`Failed to sync: ${err}`);
      });
    },
  }

  return apiCalls
}

module.exports = client