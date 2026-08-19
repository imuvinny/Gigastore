const fs = require('fs');

async function checkImage(filename) {
    // just try to see if it's a transparent PNG by checking the IHDR color type
    // PNG format: 8 bytes signature, then chunks. IHDR is first chunk.
    const buffer = fs.readFileSync(filename);
    // Color type is at byte offset 25
    const colorType = buffer[25];
    // 6 means Truecolor with alpha, 4 means Grayscale with alpha, 3 is Indexed (which could have transparency)
    // 2 is Truecolor (no alpha)
    console.log(filename, "colorType:", colorType);
}

checkImage('img1.png');
checkImage('img2.png');
checkImage('img3.png');
checkImage('img4.png');
