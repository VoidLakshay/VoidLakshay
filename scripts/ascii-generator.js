const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const imagePath = path.join(__dirname, '..', 'assets', 'avatar.png');
const outputPath = path.join(__dirname, '..', 'assets', 'ascii.txt');

// Characters for ASCII mapping from bright to dark
const density = '@%#*+=-:. ';

async function convertToAscii() {
  try {
    const image = await Jimp.read(imagePath);
    
    // Original size is 576 x 1024.
    // Crop tightly around the face (head and shoulders).
    // Assuming face is in the upper middle section.
    // crop(x, y, w, h)
    image.crop(120, 100, 336, 380);

    // Terminal characters are roughly twice as tall as they are wide.
    // Width around 38 chars. Max 35 rows.
    // Let's set width to 38.
    const aspect = image.bitmap.height / image.bitmap.width;
    const asciiWidth = 38;
    const asciiHeight = Math.round(asciiWidth * aspect * 0.55); // ~ 24 lines depending on aspect
    
    image.resize(asciiWidth, asciiHeight); 
    image.greyscale();
    image.contrast(0.2);

    let asciiArt = '';

    for (let y = 0; y < image.bitmap.height; y++) {
      let row = '';
      for (let x = 0; x < image.bitmap.width; x++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));
        const brightness = (color.r + color.g + color.b) / 3;
        
        // Map brightness to ASCII character. High brightness -> lighter character.
        // density[0] is '@' (dark), density[9] is ' ' (bright)
        // Actually for dark terminal, bright parts should be mapped to denser chars (@).
        // Brightness 255 -> dense (@)
        // Brightness 0 -> space ( )
        const charIndex = Math.floor((1 - (brightness / 255)) * (density.length - 1));
        row += density[charIndex];
      }
      asciiArt += row + '\n';
    }

    fs.writeFileSync(outputPath, asciiArt);
    console.log('ASCII art generated successfully at', outputPath);
  } catch (err) {
    console.error('Error generating ASCII art:', err);
  }
}

convertToAscii();
