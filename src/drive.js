const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const googleAuth = require('google-auto-auth');

const FIELDS = [
  'id',
  'headRevisionId',
  'name',
  'mimeType',
  'viewersCanCopyContent',
  'version',
  'webContentLink',
  'md5Checksum',
  'fullFileExtension',
];

function required() {
  throw new Error('Missing required param', this);
}

class Drive {
  constructor(keyFilepath=required()) {
    this.keyFilepath = keyFilepath;
  }

  async getAuthorizedClient() {
    if (this.client) {
      return this.client;
    }

    const authConfig = {};
    authConfig.keyFilename = this.keyFilepath;
    authConfig.scopes = [
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
    ];
    const auth = googleAuth(authConfig);

    return new Promise((resolve, reject) => {
      auth.getToken((err, res) => {
        if (err) {
          reject(err);
        }

        auth.getAuthClient(async (err, authClient) => {
          if (err) {
            reject(err);
          }

          this.client = google.drive({
            version: 'v3',
            auth: authClient,
          });

          return resolve(this.client);
        });
      });
    });
  }

  async getFiles() {
    const drive = await this.getAuthorizedClient();
    const res = await drive.files.list();
    return res.data.items || res.data.files;
  }

  async getFileStream(id, currentHash=null) {
    const drive = await this.getAuthorizedClient();
    const metadata = await drive.files.get({ fileId: id, fields: FIELDS.join(','), });

    if (!currentHash || currentHash !== metadata.data.md5Checksum) {
      const res = await drive.files.get({ fileId: id, alt: 'media' }, { responseType: 'stream' });
      return res.data;
    }
  }

  async writeFileStream(fileStream, targetPath) {
    return new Promise(async (resolve, reject) => {
      const dest = fs.createWriteStream(targetPath);
      console.log(`Writing to ${targetPath}`);

      fileStream
        .on('end', () => {
          resolve(targetPath);
        })
        .on('error', err => {
          reject(err);
        })
        .pipe(dest);
    });
  }
}

module.exports = {
  Drive,
};
