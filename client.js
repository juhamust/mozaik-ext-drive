const path = require('path');
const fs = require('fs');
const drive = require('./src/drive');

async function main() {
  const client = new drive.Drive(
    keyFilepath=process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'keys.json'),
  );
  const files = await client.getFileNames();
  console.log('Files', files);
  const tasks = files.filter(file => file.mimeType === 'image/jpeg').map(file => {
    return client.getFile(file.id).then(data => {
      fs.writeFileSync(path.join(__dirname, 'tmp', 'test.jpg'), data);
    });
  });

  await Promise.all(tasks);
  console.log('All files downloaded');
}

main().catch(console.error);
