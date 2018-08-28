const path = require('path');
const fs = require('fs');
const drive = require('./src/drive');

async function main() {
  const client = new drive.Drive(
    keyFilepath=process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'keys.json'),
  );
  const files = await client.getFileNames();
  const tasks = files.filter(file => file.mimeType === 'image/jpeg').map(async file => {
    const targetPath = path.join(__dirname, 'tmp', file.name);
    const fileStream = await client.getFileStream(file.id);
    return client.writeFileStream(fileStream, targetPath);
  });

  await Promise.all(tasks);
  console.log('All files downloaded');
}

main().catch(console.error);
