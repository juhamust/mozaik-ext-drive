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

  const info = msg => mozaik.logger.info(chalk.yellow(`[drive] ${msg}`));
  const error = msg => mozaik.logger.error(chalk.red(`[drive] ${msg}`));

  const syncFiles = () => {
    const keyFilePath = config.get('drive.keyFilePath');
    // Allow passing the Drive client via mozaik (for testing purposes)
    const clientGetter = mozaik.loadDriveClient || new drive.Drive;
    info(`Syncing files using ${keyFilePath}`);

    return clientGetter(keyFilePath)
    .getFileNames()
    .then(fileNames => {
      const progress = fileNames.map(file => {
        driveClient.getFileStream(file.id)
        .then(fileStream => {
          return driveClient.writeFileStream(fileStream);
        });
      });
      return Promise.all(progress);
    });
  };

  const apiCalls = {
    sync() {
      return syncFiles()
      .then(() => {
        info('Synced files')
      })
      .catch(err => {
        error(`Failed to sync: ${err}`);
      });
    },
  }

  return apiCalls
}

module.exports = client