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
    let date1 = new Date(req.body.startDate);
    let date2 = new Date(req.body.endDate);
    date2.setDate(date2.getDate() + 1);
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
    let date1 = new Date(req.body.startDate);
    let date2 = new Date(req.body.endDate);
    date2.setDate(date2.getDate() + 1);

    const allofthem = await Graveyard.find({}).populate("persons");
    const totalprofiles = allofthem.map((obj) => ({
      _id: obj?._id,
      name: obj?.name,
      totalprofiles: obj?.persons?.length,
      totalclients: obj?.clients?.length,
      newprofiles: obj?.persons?.filter(
        (obj) => obj.createdAt > date1 && obj.createdAt < date2
      ).length,
    }));
    res.json(totalprofiles);
  } catch (error) {
    res.json(error);
  }
});

router.post("/alluserscim/:id", async (req, res) => {
  //console.log(req.body);
  try {
    const d = new Date();
    let month = d.getMonth();
    let date1 = new Date(req.body.startDate);
    let date2 = new Date(req.body.endDate);
    date2.setDate(date2.getDate() + 1);

    const profiles = await Profile.find({});
    const users = await User.find({ graveyard: req.params.id });
    const graveyards = await Graveyard.find({ _id: req.params.id });
    const newCreatedProfiles = await Profile.find({
      createdAt: { $gte: date1, $lte: date2 },
      graveyard: req.params.id,
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

router.post("/graveyardgraphcim/:findById", async (req, res) => {
  //console.log(req.body);
  try {
    const date1 = new Date(req.body.startDate);
    const date2 = new Date(req.body.endDate);
    const allofthem = await Graveyard.find({ _id: req.params.id }).populate(
      "persons"
    );
    const totalprofiles = allofthem.map((obj) => ({
      _id: obj?._id,
      name: obj?.name,
      totalprofiles: obj?.persons?.length,
      totalclients: obj?.clients?.length,
      newprofiles: obj?.persons?.filter(
        (obj) => obj.createdAt > date1 && obj.createdAt < date2
      ).length,
    }));
    res.json(totalprofiles);
  } catch (error) {
    res.json(error);
  }
});

router.post("/addposition/:id", async (req, res) => {
  const positions = await Graveyard.findById(req.params.id);

  const positionCheck = positions.places.find(
    (place) => place.code === req.body.code
  );
  console.log(positionCheck)
  if (positionCheck) {
    return res.status(401).json({ message: "POSITION_EXISTS" });
  }
  const updatedGraveyard = await Graveyard.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        places: req.body,
      },
    },
    { new: true }
  );
  res.json(updatedGraveyard);
});

router.get("/positions/:id", async (req, res) => {
  const user = await User.findById(req.params.id).populate("graveyard");
  if (!user) return res.status(404).json({ message: "User not found" });
  const graveyard = user.graveyard;
  const places = graveyard.places;
  const graveyardProfiles = await Profile.find({
    graveyard: user.graveyard._id,
  });
  // extract profiles which same position id

  const newPlaces = places.map((place) => {
    let newPlace = {
      code: place.code,
      lat: place.lat,
      lng: place.lng,
      profiles: [],
    };
    return newPlace;
  });

  graveyardProfiles.forEach((profile) => {
    newPlaces.forEach((place) => {
      if (profile.position.code == place.code) {
        place?.profiles.push({
          _id: profile._id,
          name: profile.profileName,
          lastn: profile.profileLastName,
          birth: profile.profileDatebirth,
          died: profile.profileDatedeath,
          banner: profile?.banner,
          email: profile?.profileEmail,
          image: profile?.profileImage,
          createdAt: profile.createdAt,
        });
      }
    });
  });
  res.json(newPlaces);
});

// upload plan file image
router.post("/uploadplan", upload.single("plan"), async (req, res) => {
  const fileName = req.file.filename;

  const admin = await User.findById(req.body.id).populate("graveyard");
  const updatedGraveyard = await Graveyard.findByIdAndUpdate(
    admin?.graveyard?._id,
    {
      plan: fileName,
    },
    { new: true }
  );
  res.json(updatedGraveyard);
});

// get graveyard emplacements
router.get("/getemplacements/:id", async (req, res) => {
  const user = await User.findById(req.params.id).populate("graveyard");
  res.json(user?.graveyard?.places);
});

module.exports = router;
