const Jimp = require('jimp');

async function removeBlackBackground() {
  try {
    const inputPath = 'C:\\Users\\Dmasz\\.gemini\\antigravity-ide\\brain\\98e8f1a8-bda6-4deb-a3e0-730389c906c2\\.user_uploaded\\media_1791306849658.jpg';
    
    Jimp.read(inputPath)
      .then(image => {
        const threshold = 50; 
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
          const red = this.bitmap.data[idx + 0];
          const green = this.bitmap.data[idx + 1];
          const blue = this.bitmap.data[idx + 2];
          
          if (red < threshold && green < threshold && blue < threshold) {
            this.bitmap.data[idx + 3] = 0;
          }
        });

        image.write('public/logo.png');
        image.write('src/app/icon.png');
        console.log('Successfully processed image!');
      })
      .catch(err => {
        console.error('Error reading image:', err);
      });
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

removeBlackBackground();
