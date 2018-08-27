const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const googleAuth = require('google-auto-auth');

const DEFAULT_FIELDS = 'id,title,mimeType,userPermission,editable,copyable,shared,fileSize';

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
    authConfig.scopes = ['https://www.googleapis.com/auth/drive.readonly'];
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
            version: 'v2', // v3
            auth: authClient,
          });

          return resolve(this.client);
        });
      });
    });
  }

  async getFileNames() {
    const drive = await this.getAuthorizedClient();
    const res = await drive.files.list();
    return res.data.items || res.data.files;
  }

  async getFile(id) {
    console.log('Downloading file', id);
    const drive = await this.getAuthorizedClient();
    const metadata = await drive.files.get({ fileId: id });
    const res = await drive.files.get({ fileId: id, alt: 'media' });
    return res.data;
  }
}

module.exports = {
  Drive,
};
