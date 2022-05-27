var express = require("express");
var router = express.Router();
var Graveyard = require("../models/Graveyard");
const passport = require("passport");
var bcrypt = require("bcrypt");

const multer = require("multer");
const path = require("path");


router.get("/", async (req, res) => {
  try {
    const Graveyards = await Graveyard.find();
    res.json(Graveyards);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

// delete todo to user

// Get User by ID
router.get("/:id", async (req, res) => {
  try {
    const graveyard = await Graveyard.findById(req.params.id);
    res.json(graveyard);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

//Add User

//Register

//Delete User

router.put("/:id", async (req, res) => {
  const updatedGraveyard = await Graveyard.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ message: "Graveyard updated succesfully" });
});

//Delete Graveyard
router.delete("/:id", async (req, res) => {
  await Graveyard.findOneAndDelete(req.params.id);
  res.json({ message: "Graveyard deleted succesfully" });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./api/uploads");
  },
  filename: (req, file, cb) => {
    // console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const alowedextentions = [".png", ".pdf", ".jpeg", ".jpg"];
  const fileExtention = path.extname(file.originalname);
  cb(null, alowedextentions.includes(fileExtention));

  // if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'|| file.mimetype === 'image/jpg') {
  //     cb(null, true);
  // } else {
  //     cb(null, false);
  // }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post("/upload-file", upload.single("image"), async (req, res) => {
 // console.log(req.body);
  res.json({ message: "done" });
});

router.post("/", async (req, res) => {
  //console.log(req.body);
  const graveyardCheck = await Graveyard.findOne({ name: req.body.name });
  if (graveyardCheck !== null) {
    return res.status(401).json({ message: "GRAVEYARD_EXISTS" });
  }
  //console.log(req.body);
  const graveyard = req.body;
  const registredgraveyard = await Graveyard.create(graveyard);
  res.json(registredgraveyard);
});

module.exports = router;
