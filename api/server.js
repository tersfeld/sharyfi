const format = require("util").format;
const express = require("express");
const Multer = require("multer");
const helmet = require("helmet");
const path = require("path");
const bodyParser = require("body-parser");
const { Storage } = require("@google-cloud/storage");
const storage = new Storage();
const app = express();
const cors = require("cors");
const https = require("https");

const uuidv4 = require("uuid/v4");

const fs = require("fs");

const PORT = process.env.PORT || 8080;
const TMP_PATH = process.env.TMP_PATH || "/tmp";
const BUCKET_NAME = process.env.BUCKET_NAME;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "")));

var ds = Multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, TMP_PATH);
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});

const multer = Multer({
  storage: ds
});

const bucket = storage.bucket(BUCKET_NAME);

app.get("/", (req, res, next) => {
  res.status(200).send("OK");
});

app.post("/files/delete", (req, res, next) => {
  if (!req.body.filename) {
    res.status(400).send("No file to delete.");
    return;
  }
  const file = bucket.file(req.body.filename);
  file.delete().then(data => {
    res.status(200).send(req.body.filename + " is deleted.");
  });
});

app.get("/files/list/:expireInDays", (req, res, next) => {
  bucket
    .getFiles()
    .then(results => {
      const files = results[0];

      console.log(files.length);

      if (files.length == 0) {
        res.status(200).send("[]");
      }
      fileList = [];

      files.forEach(file => {
        fileList.push(
          new Promise((resolve, reject) => {
            const options = {
              action: "read",
              expires:
                Date.now() + 1000 * 60 * 60 * 24 * req.params.expireInDays // 24 hours
            };
            console.debug("iterating " + file.name);

            file.getSignedUrl(options).then(url => {
              const fileDescriptor = {
                uid: uuidv4(),
                name: file.name,
                status: "done",
                url: url
              };
              console.debug("resolving");
              resolve(fileDescriptor);
            });
          })
        );
      });

      Promise.all(fileList.map(p => p.catch(e => e))).then(files => {
        res.status(200).send(files);
      });
    })
    .catch(err => {
      console.error("ERROR:", err);
    });
});

// Process the file upload and upload to Google Cloud Storage.
app.post("/files/upload", multer.single("file"), (req, res, next) => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }
  console.log("Uploading file : " + req.file.originalname);

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();

  let fileStream = fs.createReadStream(req.file.path);

  blobStream.on("error", err => {
    console.log(err);
    next(err);
  });

  blobStream.on("finish", async () => {
    fs.unlink(req.file.path, function(err) {
      if (err) throw err;
      console.log("File deleted on disk!");
    });

    const options = {
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 // 24 hours
    };

    const [url] = await blob.getSignedUrl(options);
    console.log(`The signed url ${url}`);
    res.status(200).send(url);
  });

  fileStream.pipe(blobStream);
});

const httpsServer = https.createServer(app);
httpsServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
