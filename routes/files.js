const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file.js");
const { v4: uuid4 } = require("uuid");
const { parse } = require("path");

let Storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({
  storage: Storage,
  limit: { fileSize: 1000000 * 100 },
}).single("myfile");
router.post("/", (req, res) => {
  //validate string
  //install multer library

  //store files
  upload(req, res, (err) => {
    if (!req.file) {
      return res.json({ error: "All fields are required" });
    }
    if (err) {
      return res.status(500).send({ error: err.message });
    } else {
      //store into database
      (async function f() {
        const file = new File({
          filename: req.file.filename,
          uuid: uuid4(),
          path: req.file.path,
          size: req.file.size,
        });
        const response = await file.save();
        return res.json({
          file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
        });
      })()
      //http://localhost:3000/files/412436fw-1223e3fefrev;
    }
  });

  //response ->link
});

router.post('/send', async (req, res) => {
  const {uuid, emailTo, emailFrom} = req.body;
  if(!uuid || !emailTo || !emailFrom) {
    return res.status(422).send({error : 'All fields are required'});
  }

  //get data from database
  const file = await File.findOne({uuid : uuid});

  if(file.sender) {
    return res.status(422).send({error : 'Email already sent.'});
  }

  file.sender = emailFrom;
  file.reciever = emailTo;
  const response = await file.save();


  //send mail
  const sendMail = require('../services/email-service');
  sendMail({
    from : emailFrom,
    to : emailTo,
    subject : 'inShare file sharing',
    text : `${emailFrom} shared a file with you`,
    html : require('../services/emailTemplate')({
      emailFrom : emailFrom,
      downloadLink : `${process.env.APP_BASE_URL}/files/${file.uuid}`,
      size : parseInt(file.size / 100) + 'KB',
      expires : '24 hours'
    })


  });
  return res.send({success : true});
  
})

module.exports = router;
