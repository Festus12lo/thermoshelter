const https = require('https');
const fs = require('fs');

const url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Styrofoam_packaging.jpg/500px-Styrofoam_packaging.jpg';
const dest = 'public/materials/eps.jpg';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, (res) => {
  if (res.statusCode === 200) {
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Success');
    });
  } else {
    console.log(`Failed: ${res.statusCode}`);
  }
}).on('error', (err) => {
  console.error(err);
});
