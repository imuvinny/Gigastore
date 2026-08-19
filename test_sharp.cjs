const sharp = require('sharp');

async function check(file) {
    try {
        const metadata = await sharp(file).metadata();
        if (!metadata.hasAlpha) {
            console.log(file, "No alpha channel -> BAD");
            return;
        }
        const stats = await sharp(file).stats();
        const alpha = stats.channels.find(c => c.mean !== undefined && stats.channels.indexOf(c) === 3);
        if (!alpha) {
            console.log(file, "No alpha stats -> BAD");
            return;
        }
        console.log(file, "Alpha min:", alpha.min, "mean:", alpha.mean);
        if (alpha.min > 0) {
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
