const fs = require('fs');
const os = require('os');
const path = require('path');
const client = require('../src/client');

test('should sync', () => {
  const files = [{
    id: 'abc',
    name: 'mozaik-logo',
    mimeType: 'image/png',
    md5Checksum: 'cc95a34ac5e8c5b2ae337c0c3fd5269f',
    fullFileExtension: 'png',
  }, {
    id: 'doc',
    mimeType: 'application/pdf',
    name: 'document',
    fullFileExtension: 'pdf',
    md5Checksum: 'abc',
  }];
  const driveMock = {
    getFiles: () => Promise.resolve(files),
    getFileStream: () => Promise.resolve(fs.createReadStream(path.join(__dirname, 'fixtures', 'mozaik-logo.png'))),
    writeFileStream: (stream, fileName) => expect(fileName).toEqual('cc95a34ac5e8c5b2ae337c0c3fd5269f.png'),
  };
  const mozaikMock = {
    loadApiConfig: config => {
      // Monkey-patch the config for testing purposes
      config.get = key => {
        switch (key) {
          case 'drive.keyFilePath':
            return 'foo.json';

          case 'drive.publicDir':
            return os.tmpdir();

          default:
            break;
        }
      };
    },
    loadDriveClient: keyFilePath => driveMock,
    logger: {
      info: msg => console.info(msg),
      error: msg => console.error(msg),
    }
  }
  const apis = client(mozaikMock);

  return apis.sync();
})
