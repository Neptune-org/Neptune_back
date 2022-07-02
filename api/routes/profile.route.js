const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/Users");
const Ticket = require("../models/tickets");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");


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
  }
});

router.post("/searchbyname", async (req, res) => {
  try {
    const myprofile = await Profile.findOne({ _id: req.body.myid });
    const name = req.body.fullname.split(" ").slice(0, -1).join(" ");
    const lastname = req.body.fullname.split(" ").slice(-1).join(" ");
    const profiles = await Profile.find({
      $and: [
        { profileLastName: { $regex: ".*" + lastname + ".*" } },
        { profileName: { $regex: ".*" + name + ".*" } },
      ],
    });
    const ids = myprofile.invitationsout.map((profile) => profile.prof);
    const idsf = myprofile.friends.map((profile) => profile.prof);
    const filtredProfiles = profiles.filter((profile) => {
      return !ids.includes(profile._id) && !idsf.includes(profile._id);
    });
    res.json(filtredProfiles);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});
router.post("/searchbyid", async (req, res) => {
  try {
    const myprofile = await Profile.findOne({ _id: req.body.myid })
      .populate({
        path: "friends",
        populate: {
          path: "prof",
        },
      })
      .populate({
        path: "invitationsout",
        populate: {
          path: "prof",
        },
      });

    const profiles = await Profile.findById(req.body.id);

    res.json([profiles]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});
// delete todo to profile

// Get Profile by ID
router.get("/:id", async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate({
      path: "friends",
      populate: {
        path: "prof",
      },
    });
    const profileSortedTimeline = profile.timeline.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    }
    );
    profile.timeline = profileSortedTimeline;
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});



//Register
router.get("/mytickets/:id", async (req, res) => {
  try {
    const tickets = await Ticket.find({ prop: req.params.id });
    res.json(tickets);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/stafftickets/:id", async (req, res) => {
  try {
    const mytickets = await Ticket.find({ assigne: req.params.id });
    const opentickets = await Ticket.find({ status: "open" });
    const tickets = mytickets.concat(opentickets)

    res.json(tickets);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.post("/assignticket/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id },
      {status:"progress", assigne: req.body.assigne },
      { new: true }
    );
    res.json(ticket);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});



router.get("/getticket/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate({
      path: "messages",
      populate: {
        path: "sender",
      },
    });
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
      subject: req.body.subject,
      messages: { msg: req.body.message, send: 0, sender: req.params.id },
    };
    const tickets = await Ticket.create(tick);
    res.json(tickets);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.put("/sendmessage/:id", async (req, res) => {
  try {
    let tick = {
      messages: {
        msg: req.body.message,
        send: req.body.side,
        sender: req.body.sender,
      },
    };
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $push: { messages: tick.messages } },
      { new: true }
    );
    res.json(ticket);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.put("/addhistory/:id", async (req, res) => {
  try {
    let tick = {
      history: {
        msg: req.body.message,
      },
    };
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $push: { history: tick.history } },
      { new: true }
    );
    res.json(ticket);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
}
);

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
      path: "clients",
      populate: {
        path: "profiles",
      },
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
      };
      if (req.body.bio) {
        profile.bio = req.body.bio;
      }
      if (req.files.profileimage) {
        profile.profileImage = req?.files?.profileimage[0]?.filename;
      }
      if (req.files.banner) {
        profile.banner = req.files?.banner[0]?.filename;
      }
      if (req.files.files) {
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

router.post("/sendinvitation", async (req, res) => {
  try {
    const id = req.body.id;
    const parent = {
      prof: req.body.reciever,
      lien: req.body.link,
    };

    const forReciver = {
      prof: req.body.id,
      lien: req.body.link,
    };
    const profile = await Profile.findByIdAndUpdate(
      id,
      { $push: { invitationsout: parent } },
      { new: true }
    );
    const reciever = await Profile.findByIdAndUpdate(
      req.body.reciever,
      { $push: { invitationsin: forReciver } },
      { new: true }
    );

    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/prof/:id", async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id)
      .populate({
        path: "invitationsout",
        populate: {
          path: "prof",
        },
      })
      .populate({
        path: "friends",
        populate: {
          path: "prof",
        },
      })
      .populate({
        path: "invitationsin",
        populate: {
          path: "prof",
        },
      });
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.post("/accept", async (req, res) => {
  try {
    const friend = {
      prof: req.body.ids,
      lien: req.body.lien,
    };
    const friend2 = {
      prof: req.body.id,
      lien: req.body.lien2,
    };
    const profile = await Profile.findOneAndUpdate(
      { _id: req.body.id },
      {
        $pull: {
          invitationsin: { prof: req.body.ids },
        },
      },
      { new: true }
    );
    const adding = await Profile.findOneAndUpdate(
      { _id: req.body.id },
      {
        $push: {
          friends: friend,
        },
      },
      { new: true }
    );
    const adding2 = await Profile.findOneAndUpdate(
      { _id: req.body.ids },
      {
        $push: {
          friends: friend2,
        },
      },
      { new: true }
    );
    const profile2 = await Profile.findOneAndUpdate(
      { _id: req.body.ids },
      {
        $pull: {
          invitationsout: { prof: req.body.id },
        },
      },
      { new: true }
    );
    if (profile2) {
      return res.status(200).json(profile);
    }
    return res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/getallinv/:id", async (req, res) => {
  try {
    const profile = await User.findById(req.params.id)
      .populate({
        path: "profiles",
        populate: {
          path: "invitationsout.prof",
        },
      })
      .populate({
        path: "profiles",
        populate: {
          path: "invitationsin.prof",
        },
      })
      .populate({
        path: "profiles",
        populate: {
          path: "friends.prof",
        },
      });
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});
// change ticket status
router.put("/changestatus/:id", async (req, res) => {
  try {
    const Tickets = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: req.body.status,
        },
      },
      { new: true }
    );
    res.json(Tickets);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.post("/removeinv", async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { _id: req.body.id },
      {
        $pull: {
          invitationsin: { prof: req.body.ids },
        },
      },
      { new: true }
    );  
    const profile2 = await Profile.findOneAndUpdate(
      { _id: req.body.ids },
      {
        $pull: {
          invitationsout: { prof: req.body.id },
        },
      },
      { new: true }
    );
    if (profile2) {
      return res.status(200).json(profile);
    }
    return res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
}); 

router.post("/notifsin", async (req, res) => {
  try {
   counting = await User.aggregate ([
    {
      '$match': {
        '_id': mongoose.Types.ObjectId(req.body.id)
      }
    }, {
      '$unwind': {
        'path': '$profiles'
      }
    }, {
      '$lookup': {
        'from': 'profiles', 
        'localField': 'profiles', 
        'foreignField': '_id', 
        'as': 'prof'
      }
    }, {
      '$set': {
        'profs': {
          '$arrayElemAt': [
            '$prof', 0
          ]
        }
      }
    }, {
      '$project': {
        'profs': 1
      }
    }, {
      '$unwind': {
        'path': '$profs.invitationsin'
      }
    }, {
      '$count': 'prof'
    }
  ]);
  if (counting[0]?.prof > 0) {
    res.json(counting[0]?.prof);
  }
  else {
    res.json(0);
  }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});


router.post("/addtimeline/:id", async (req, res) => {
  try {
    const timeline ={
      message : req.body.message,
      date : req.body.date,
    }
    const profile = await Profile.findOneAndUpdate(
      { _id: req.params.id },
      {
        $push: {
          timeline: timeline,
        },
      },
      { new: true }
    );  
   
  
    return res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
}); 

router.post("/addphototoalbum/:id", upload.fields([
  {
    name: "files",
    maxCount: 30,
  },
]), async (req, res) => {
  try {
    const allfiles = req.files?.files?.map((file) => file?.filename);
    console.log(allfiles)

    const album ={
      name : req.body.name,
      images : allfiles,
    }
console.log(album )
   
    //add photo to album
    const profile = await Profile.findOneAndUpdate(
      { _id: req.params.id },
      {
        $push: {
          albums: album,
        },
      },
      { new: true }
    );
    return res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
}); 

module.exports = router;
