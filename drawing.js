
async function toBrailleImg(imageData, width = 250) {
    const I2b = require("img2braille")
    return await I2b.braillefy(imageData, width, {
        dither: true,
        invert: false,
        //      color: false 
    })

}


const fs = require('fs');

function bufferToPath(buffer) {
    const filePath = '/tmp/img.jpg'; // Replace with the desired file path
    fs.writeFileSync(filePath, buffer, { flag: 'w' });
    return filePath;
}


/*
(async () => {
    console.log("\nTEST BRAILLE:\n")
    console.log(await toBrailleImg("res/stockImages/stock1.jpg"))
})();
*/

module.exports = { toBrailleImg, bufferToPath }
