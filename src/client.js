'use strict'

require('isomorphic-fetch');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const drive = require('./drive');
const config = require('./config');

const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
];

function createDir(path) {
  // If already exists, no-op
  if (fs.existsSync(path)) {
    return path;
  }

  fs.mkdirSync(path);
  return path;
}

/**
 * @param {Mozaik} mozaik
 */
const client = mozaik => {
  mozaik.loadApiConfig(config);

  const info = msg => mozaik.logger.info(chalk.yellow(`[drive] ${msg}`));
  const error = msg => mozaik.logger.error(chalk.red(`[drive] ${msg}`));

  /**
   * Sync photos from Drive into local public directory
   * where they can be hosted.
   */
  const syncFiles = () => {
    const keyFilePath = config.get('drive.keyFilePath');
    const publicImagePath = path.join(config.get('drive.publicDir'), 'mozaik-ext-drive');
    // Allow passing the Drive client via mozaik (for testing purposes)
    const clientGetter = mozaik.loadDriveClient || new drive.Drive;
    info(`Syncing files using ${keyFilePath}`);

    // Create subdir if needed
    createDir(publicImagePath);
    const driveClient = clientGetter(keyFilePath);

    return driveClient
    .getFiles()
    .then(fileNames => {
      const ready = fileNames
      .filter(file => SUPPORTED_MIME_TYPES.indexOf(file.mimeType) !== -1)
      .map(file => {
        driveClient.getFileStream(file.id)
        .then(fileStream => {
          const fileName = `${file.md5Checksum}.${file.fullFileExtension}`;
          info(`Writing ${file.name}.${file.fullFileExtension} to ${fileName}`);
          return driveClient.writeFileStream(fileStream, fileName);
        });
      });
      return Promise.all(ready);
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