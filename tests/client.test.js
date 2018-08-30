const fs = require('fs');
const os = require('os');
const path = require('path');
const client = require('../src/client');

test('should sync', () => {
  const driveMock = {
    getFiles: () => Promise.resolve([])
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
