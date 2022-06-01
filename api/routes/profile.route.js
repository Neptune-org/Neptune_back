const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/Users");
const Ticket = require("../models/tickets");
const multer = require("multer");
const path = require("path");

router.get("/", async (req, res) => {
  try {
    const profile = await Profile.find({}).populate("cimitiere");
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/alltickets", async (req, res) => {
  try {
    const tickets = await Ticket.find({}).populate("prop");
    res.json(tickets);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }});

// delete todo to profile

// Get Profile by ID
router.get("/:id", async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});


//Register
router.get("/mytickets/:id", async (req, res) => {
  try {
    const tickets = await Ticket.find({prop : req.params.id});
    res.json(tickets);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/getticket/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate({
      path : 'messages',
      populate : {
        path : 'sender'
      }
    });;
    res.json(ticket);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});
//add ticket
router.post("/addticket/:id", async (req, res) => {
  try {
    let tick = {
      prop: req.params.id,
      subject : req.body.subject,
      messages : {msg:req.body.message,send:0,sender:req.params.id},
    }
    const tickets = await Ticket.create(tick)
    res.json(tickets);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.put("/sendmessage/:id", async (req, res) => {
  try {
    let tick = {
      messages : {msg:req.body.message,send:req.body.side,sender:req.body.sender},
    }
    const ticket = await Ticket.findByIdAndUpdate(req.params.id,{$push : {messages : tick.messages}},{new : true});
    res.json(ticket);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.put("/:id", async (req, res) => {
  const updateProfile = await Profile.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );
  res.json({ message: "Profile updated succesfully" });
});

//Delete Profile
router.delete("/:id", async (req, res) => {
  await Profile.findOneAndDelete(req.params.id);
  res.json({ message: "Profile deleted succesfully" });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./api/uploads");
  },
  filename: (req, file, cb) => {
    let fn =
      file.originalname.split(path.extname(file.originalname))[0] +
      "-" +
      Date.now() +
      path.extname(file.originalname);

    cb(null, /* file.originalname */ fn);
  },
});

const fileFilter = (req, file, cb) => {
  const alowedextentions = [".png", ".pdf", ".jpeg", ".jpg", ".mp4"];
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
router.post(
  "/upload-multi",
  upload.fields([
    {
      name: "banner",
      maxCount: 5,
    },
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    const allfiles = req.files.banner.map((file) => file?.filename);
    // console.log(req.files.image[0]?.filename);
    // console.log(allfiles);

    res.json(req.files);
  }
);

router.post("/addprofile", upload.array("banner[]", 3), async (req, res) => {
  //console.log(req.files);
  const profileCheck = await Profile.findOne({ name: req.body.name });
  //console.log(profileCheck);
  if (profileCheck !== null) {
    return res.status(401).json({ message: "PROFILE_EXISTS" });
  }
  //console.log(req.body);
  const profile = {
    profileName: req.body.profileName,
    profileLastName: req.body.profileLastName,

    bio: req.body.bio,
    graveyard: req.body.graveyard,
    banner: req.files[0]?.filename,
    files: [req.files[1]?.filename, req.files[2]?.filename],
  };
  const registredprofile = await Profile.create(profile);
  res.json(registredprofile);
});

router.get("/userprofiles/:id", async (req, res) => {
  try {
    const profiles = await User.findById(req.params.id).populate("profiles");
    res.json(profiles);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/staffgetprofiles/:id", async (req, res) => {
  try {
    const profiles = await User.findById(req.params.id).populate("profiles");
    res.json(profiles);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/staffgetclients/:id", async (req, res) => {
  try {
    const clients = await User.findById(req.params.id).populate({
      path : 'clients',
      populate : {
        path : 'profiles'
      }
    });
    res.json(clients);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.put(
  "/update/:id",
  upload.fields([
    {
      name: "banner",
      maxCount: 1,
    },
    {
      name: "profileimage",
      maxCount: 1,
    },
    {
      name: "files",
      maxCount: 30,
    },
  ]),
  async (req, res) => {
    try {
      // console.log(req.files);
      const allfiles = req.files?.files?.map((file) => file?.filename);
      const oldprof = await Profile.findById(req.params.id);
      const profile = {
        files: oldprof.files,
      } ;
      if(req.body.bio){
        profile.bio = req.body.bio;
      }
      if (req.files.profileimage) {
        profile.profileImage = req?.files?.profileimage[0]?.filename;
      }
      if (req.files.banner) {
        profile.banner = req.files?.banner[0]?.filename;
      }
      if(req.files.files){
        profile.files = [...profile.files, ...allfiles];
      }
      const updatedProfile = await Profile.findByIdAndUpdate(
        req.params.id,
        profile,
        {
          new: true,
        }
      );
      //console.log(req.body);
      res.send("done");
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "internal server err" });
    }
  }
);
module.exports = router;
