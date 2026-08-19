const { Jimp } = require('jimp');

async function check(file) {
    try {
        const image = await Jimp.read(file);
        let hasTransparent = false;
        // Jimp 1.0 gets pixel color as an object using getPixelColor
        for (let x = 0; x < image.bitmap.width; x += 10) {
            for (let y = 0; y < image.bitmap.height; y += 10) {
                const color = image.getPixelColor(x, y);
                // Jimp 1.0: Jimp.rgbaToInt, Jimp.intToRGBA
                // Wait, in Jimp 1.0 it's Jimp.intToRGBA on the constructor?
                // Let's just check if alpha is less than 255. In Jimp, the hex is 0xRRGGBBAA
                // So color & 0xFF gives the alpha value
                if ((color & 0xFF) < 255) {
                    hasTransparent = true;
                    break;
                }
            }
            if (hasTransparent) break;
        }
        if (!hasTransparent) {
            console.log(file, "Solid background -> BAD");
        } else {
            console.log(file, "Transparent background -> GOOD");
        }
    } catch(e) {
        console.log(file, "Error:", e.message);
    }
}

async function run() {
    await check('img1.png');
    await check('img2.png');
    await check('img3.png');
    await check('img4.png');
}
run();
