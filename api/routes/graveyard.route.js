const express = require("express");
const router = express.Router();
const Graveyard = require("../models/Graveyard");
const passport = require("passport");
const bcrypt = require("bcrypt");
const Prices = require("../models/Price");
const multer = require("multer");
const path = require("path");
const User = require("../models/Users");
const Profile = require("../models/Profile");

router.get("/", async (req, res) => {
  try {
    const Graveyards = await Graveyard.find();
    res.json(Graveyards);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/prices", async (req, res) => {
  try {
    const prices = await Prices.find();
    res.json(prices);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});
router.post("/prices", async (req, res) => {
  try {
    const prices = await Prices.create(req.body);
    res.json(prices);
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
  const updatedGraveyard = await Graveyard.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );
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

router.post("/now", async (req, res) => {
  //console.log(req.body);
  try {
    const d = new Date();
    let month = d.getMonth();
    const newCreatedProfiles = await Profile.find({
      createdAt: { $gte: new Date(d.getFullYear(), month, 1) },
    });
    res.json(newCreatedProfiles);
  } catch (error) {
    res.json(error);
  }
});
router.post("/allusers", async (req, res) => {
  //console.log(req.body);
  try {
    const d = new Date();
    let month = d.getMonth();
    const date1 = new Date(req.body.startDate);
    const date2 = new Date(req.body.endDate);

    const profiles = await Profile.find({});
    const users = await User.find({});
    const graveyards = await Graveyard.find({});
    const newCreatedProfiles = await Profile.find({
      createdAt: { $gte: date1, $lte: date2 },
    });
    const response = {
      profiles: profiles.length,
      users: users.length,
      graveyards: graveyards.length,
      newCreatedProfiles: newCreatedProfiles,
    };
    res.json(response);
  } catch (error) {
    res.json(error);
  }
});

router.post("/graveyardgraph", async (req, res) => {
  //console.log(req.body);
  try {

    const date1 = new Date(req.body.startDate);
    const date2 = new Date(req.body.endDate);
    const allofthem = await Graveyard.find({}).populate("persons");
    const totalprofiles = allofthem.map((obj) => ({
      _id:obj?._id,
      name: obj?.name,
      totalprofiles: obj?.persons?.length,
      totalclients:obj?.clients?.length,
      newprofiles: obj?.persons?.filter(
        (obj) =>
          obj.createdAt >
          date1 &&
          obj.createdAt <
          date2

      ).length,
    }));
    res.json(totalprofiles);
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
