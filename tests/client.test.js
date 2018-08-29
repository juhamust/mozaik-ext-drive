const client = require('../src/client');

test('should sync', () => {
  const driveMock = {
    getFileNames: () => Promise.resolve([])
  };
  const mozaikMock = {
    loadApiConfig: config => {
      // Monkey-patch the config
      config.get = key => 'foo.json';
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
