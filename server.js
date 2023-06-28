const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const upload = multer();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { compressStringToBytes, decompressBytesToString, bufferToDataURL } = require('./compression.js');
const { toBrailleImg, bufferToPath } = require('./drawing.js');

const sqlite = require('better-sqlite3');
const db = sqlite('foobar.db');
db.pragma('journal_mode = WAL');


// takes the list of compressed images to decompress them
/*
function decompressImageData(images) {

  for (let i = 0; i < images.length; i++) {
    try {
      const imageData = images[i].imagedata;
      const decompressedData = decompressBytesToString(imageData);
      images[i].imageDecompressed = decompressedData;

    } catch (err) {
      console.error(err)
      images[i].imageDecompressed = null;
    }
  }
}
*/


// Render HTML file
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'res/index.html'));
});

// GET /gallery/all endpoint
app.get('/gallery/all', function (req, res) {


  const allImages = db.prepare("SELECT * FROM images WHERE id>12;").all();



  // decompress the images from the db before sending
  //decompressImageData(allImages)

  // Return the images as a response
  res.json(allImages);
});









// GET /gallery endpoint
app.get('/gallery', function (req, res) {
  // Code to retrieve approved images from the database
  const approvedImages = db.prepare("SELECT * FROM images WHERE id IN (SELECT image_id FROM image_moderations WHERE approved = 1)").all();

  // Return the images as a response
  res.json(approvedImages);
});

// POST /submit endpoint - image submission
app.post('/submit', upload.single('imageData'), async function (req, res) {
  try {
    //image data:
    const imageData = req.file.buffer;
    const title = req.body.title;
    console.log(bufferToPath(imageData))
    const imageBraille = await toBrailleImg(bufferToPath(imageData), 250)
    console.log("\nBRAILLE IMAGE: \n" + imageBraille.slice(0, 900) + "\n")
    // (compression not inserted to db for now)
    //const imageBrailleCompressed = compressStringToBytes(imageBraille)
    //console.log(`\nBRAILLE IMAGE (${typeof (imageBrailleCompressed)}): \n` + imageBrailleCompressed.slice(0, 300) + "\n")
    //console.log(imageBrailleCompressed)

    //for logs:
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    // log insertion:
    const logInsertSmtp = db.prepare(`INSERT INTO log (ip_address, user_agent) ` +
      `VALUES ('${ip}', '${userAgent}')`).run();
    const logId = db.prepare(`SELECT last_insert_rowid() as 'lastID' `).all()[0].lastID; //get logId from another query
    console.log(`Inserted log row with ID: ${JSON.stringify(logId)}`);

    // image insertion:

    const imageInsertSmtp = db.prepare(`INSERT INTO images (imageData, log_id, title) ` +
      `VALUES ('${imageBraille}', ${logId}, '${title}')`).run();
    const imageId = db.prepare(`SELECT last_insert_rowid() as 'lastID' `).all()[0].lastID; //get logId from another query

    console.log(`Inserted image row with ID: ${imageId}`);

    // Return success response
    res.status(200).json({ success: true, message: "Image submitted successfully! \n" + `   data: ${imageBraille.slice(0, 22)}\n   inserttitle: ${title}` });
  } catch (error) {
    // Return error response
    res.status(500).json({ success: false, message: "Failed to submit image: \n  " + error.message });
  }
});

// POST /moderate endpoint
app.post('/moderate', function (req, res) {
  // Code to handle image moderation
  // Retrieve an unapproved image from the database
  // Present the image to the submitter for moderation
  // Record the moderation action in the database
  // Mark the image as approved or denied
  // Return a response indicating the success or failure of the moderation
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
