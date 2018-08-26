const path = require('path');
const { google } = require('googleapis');
const googleAuth = require('google-auto-auth');

class Drive {
  constructor(opts) {
    this.keyFilepath = opts.keyFilepath;
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
            version: 'v3',
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
    console.log('FILES', res.data.files);
  }
}

async function main() {
  const drive = new Drive({
    keyFilepath: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'keys.json'),
  });
  return drive.getFileNames();
}

main().catch(console.error);