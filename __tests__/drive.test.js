const drive = require('../src/drive.js');

test('should load', () => {
  const testKeyFilePath = 'foo.json';
  const client = new drive.Drive(testKeyFilePath);
});
