const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const Graveyard = require("../models/Graveyard");
const Profile = require("../models/Profile");
const ejs = require("ejs");
const passport = require("passport");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// Get all users

/* router.get(
  "/",
  passport.authenticate("bearer", { session: false }),
  async (req, res) => {
    try {
      console.log(req.user);
      const allUsers = await User.find({}).populate("ToDo");
      res.json(allUsers);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "internal server err" });
    }
  }
);*/
router.get("/", async (req, res) => {
  try {
    const allUsers = await User.find();
    res.json(allUsers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/getsupers", async (req, res) => {
  try {
    const allUsers = await User.find({ role: "superadmin" });
    res.json(allUsers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/getstaff/:id", async (req, res) => {
  try {
    const allUsers = await User.find({
      $or: [
        { role: "admin" },
        { role: "gstaff" },
        { role: "gadmin" },
        { role: "gcompta" },
      ],
      graveyard: req.params.id,
    });
    res.json(allUsers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/getastaff", async (req, res) => {
  try {
    const allUsers = await User.find({
      $or: [{ role: "sales" }, { role: "sadmin" }, { role: "help" }],
    });
    res.json(allUsers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/getadmins", async (req, res) => {
  try {
    const allUsers = await User.find({ role: "admin" }).populate("graveyard");
    res.json(allUsers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/getadminsstaff/:id", async (req, res) => {
  try {
    const allUsers = await User.find({
      role: "admin",
      vendor: req.params.id,
    }).populate("graveyard");
    res.json(allUsers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/getclients/:id", async (req, res) => {
  try {
    const allUsers = await User.find({
      role: "client",
      graveyard: req.params.id,
    }).populate("profiles");
    res.json(allUsers);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "User not found" });
  }
});

router.get("/getprofiles/:id", async (req, res) => {
  try {
    const allProfiles = await Profile.find({
      graveyard: req.params.id,
    });
    res.json(allProfiles);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

//get filtred profiles
router.post("/getfiltredprofiles/:id", async (req, res) => {
  try {
    const date1 = new Date(req.body.startDate);
    const date2 = new Date(req.body.endDate);
    const allProfiles = await Profile.find({
      graveyard: req.params.id,
      createdAt: { $gte: date1, $lte: date2 },
    }).populate("graveyard");
    res.json(allProfiles);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

// Get User by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("graveyard");
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

//Add User

//Register

//Delete User
router.get("/pop/:id", async (req, res) => {
  try {
    const profile = await User.findById(req.params.id)
      .populate("profiles")
      .populate({
        path: "friends",
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

//Delete User
router.delete("/:id", async (req, res) => {
  await User.deleteOne({ _id: req.params.id })
    .then(() =>
      res
        .status(200)
        .json({ msg: `User with id : ${req.params.id} has been removed` })
    )
    .catch((err) => res.status(400).json({ error: err }));
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
  res.json({ message: "done" });
});

router.put("/editadmin/:id", upload.single("userimage"), async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  const updatedGraveyard = await Graveyard.findByIdAndUpdate(
    req.body.graveyard,
    {
      name: req.body.gname,
      address: req.body.address,
    },
    { new: true }
  );

  res.json({ message: "User updated succesfully", status: 200 });
});

router.put(
  "/editsuperadmin/:id",
  upload.single("userimage"),
  async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: "User updated succesfully", status: 200 });
  }
);

router.post("/", upload.single("image"), async (req, res) => {
  const usercheck = await User.findOne({ email: req.body.email });
  if (usercheck !== null) {
    return res.status(401).json({ message: "EMAIL_EXISTS" });
  }
  //console.log(req.body);
  const hashedpassword = await bcrypt.hash(req.body.password, 10);
  const myuser = req.body;
  myuser.password = hashedpassword;
  const newuser = {
    name: req.body.name,
    lastn: req.body.lastn,
    Datebirth: req.body.Datebirth,
    email: req.body.email,
    password: req.body.password,
    sex: req.body.sex,
    role: req.body.role,
    userimage: req.file?.filename,
    phone: req.body.phone,
  };
  const registreduser = await User.create(newuser);
  res.json(registreduser);
});

router.post("/addsuperadmin", upload.single("userimage"), async (req, res) => {
  const usercheck = await User.findOne({ email: req.body.email });
  if (usercheck !== null) {
    return res.status(401).json({ message: "EMAIL_EXISTS" });
  }
  //console.log(req.body);
  const hashedpassword = await bcrypt.hash(req.body.password, 10);
  const myuser = req.body;
  console.log(req.body);
  myuser.password = hashedpassword;
  let myfile = "avatar.jpg";
  if (req.file) {
    myfile = req?.file.filename;
  }
  const newuser = {
    name: req.body.name,
    lastn: req.body.lastn,
    Datebirth: req.body.Datebirth,
    email: req.body.email,
    password: req.body.password,
    sex: req.body.sex,
    role: "superadmin",
    userimage: myfile,
    phone: req.body.phone,
  };
  const registreduser = await User.create(newuser);
  res.json(registreduser);
});

router.post("/addadmin", upload.single("userimage"), async (req, res) => {
  const usercheck = await User.findOne({ email: req.body.email });
  if (usercheck !== null) {
    return res.status(401).json({ message: "EMAIL_EXISTS" });
  }
  const pass = req.body.password;
  //console.log(req.body);
  let rand = (Math.random() + 1).toString(36).substring(7);

  const hashedpassword = await bcrypt.hash(rand, 10);
  const myuser = req.body;
  myuser.password = hashedpassword;

  const mygraveyard = {
    name: req.body.gname,
    Lng: req.body.logitude,
    funeral_home: req.body.funeral_home,
    address: req.body.address,
    Lat: req.body.latitude,
  };
  const registreduser = await Graveyard.create(mygraveyard).then((d) => {
    let myfile = "avatar.jpg";
    if (req.file) {
      myfile = req?.file.filename;
    }
    User.create({
      name: req.body.name,
      lastn: req.body.lastn,
      Datebirth: req.body.Datebirth,
      email: req.body.email,
      password: req.body.password,
      sex: req.body.sex,
      role: req.body.role,
      userimage: myfile,
      graveyard: d._id,
      phone: req.body.phone,
      sub: req.body.sub,
      vendor: req.body.vendor,
    }).then(async (k) => {
      const l = await User.findByIdAndUpdate(
        req.body.vendor,
        { $push: { clients: k._id } },
        {
          new: true,
        }
      );
    });
  });
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });
  const template = fs.readFileSync(
    path.resolve("./api/views", "sendmail.html"),
    {
      encoding: "utf-8",
    }
  );
  const html = ejs.render(template, {
    name: req.body.name,
    lastname: req.body.lastn,
    password: rand,
    email: req.body.email,
    grave: req.body.gname,
  });

  let info = await transporter.sendMail({
    from: "mohamedaziz.sahnoun@esprit..tn",
    to: req.body.email,
    subject: "Skiesbook",
    html: html,
  });
  res.json(registreduser);
});
router.put("/:id", upload.single("userimage"), async (req, res) => {
  try {
    const usercheck = await User.findOne({ email: req.body.email });
    if (usercheck !== null && usercheck._id != req.params.id) {
      return res.status(401).json({ message: "EMAIL_EXISTS" });
    }
    if (req.body.password) {
      const hashedpassword = await bcrypt.hash(req.body.password, 10);
      const myuser = req.body;
      myuser.password = hashedpassword;
      if (req.file) {
        myuser.userimage = req.file.filename;
      }
      const updateduser = await User.findByIdAndUpdate(req.params.id, myuser, {
        new: true,
      });
      res.status(200).json(updateduser);
    } else {
      const myuser = req.body;
      if (req.file) {
        myuser.userimage = req.file.filename;
      }
      const updateduser = await User.findByIdAndUpdate(req.params.id, myuser, {
        new: true,
      });
      res.status(200).json(updateduser);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});
router.post("/addclient", upload.single("userimage"), async (req, res) => {
  const usercheck = await User.findOne({ email: req.body.email });
  if (usercheck !== null) {
    return res.status(401).json({ message: "EMAIL_EXISTS" });
  }
  //console.log(req.body);
  let rand = (Math.random() + 1).toString(36).substring(7);
  const hashedpassword = await bcrypt.hash(rand, 10);
  const myuser = req.body;

  let wow = [];
  const addProfile = await Profile.insertMany(
    JSON.parse(req.body.profiles)
  ).then((d) => {
    d.map((i) => {
      wow.push(i._id);
    });
  });
  let myfile = "avatar.jpg";
  if (req.file) {
    myfile = req?.file.filename;
  }
  const registreduser = await User.create({
    name: req.body.name,
    lastn: req.body.lastn,
    Datebirth: req.body.Datebirth,
    address: req.body.address,
    postalcode: req.body.postalcode,
    email: req.body.email,
    password: hashedpassword,
    phone: req.body.phone,
    sex: req.body.sex,
    role: req.body.role,
    userimage: myfile,
    graveyard: req.body.graveyard,
    profiles: wow,
    vendor: req.body.vendor,
  });
  const addingprof = await User.findByIdAndUpdate(
    req.body.vendor,
    { $push: { profiles: wow } },
    {
      new: true,
    }
  );
  const addingclient = await User.findByIdAndUpdate(
    req.body.vendor,
    { $push: { clients: registreduser._id } },
    {
      new: true,
    }
  );
  const addingtograveyard = await Graveyard.findByIdAndUpdate(
    req.body.graveyard,
    { $push: { persons: wow } },
    {
      new: true,
    }
  );
  const addingclienttograveyard = await Graveyard.findByIdAndUpdate(
    req.body.graveyard,
    { $push: { clients: registreduser._id } },
    {
      new: true,
    }
  );

  res.json(registreduser + addProfile);
});
router.post("/resetpassword", async (req, res) => {
  try {
    console.log(req.body);
    const usercheck = await User.findOne({ email: req.body.email });

    if (usercheck) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "mohamedaziz.sahnoun@esprit..tn",
          pass: process.env.PASS,
        },
      });
      const template = fs.readFileSync(
        path.resolve("./api/views", "requestpasswod.html"),
        {
          encoding: "utf-8",
        }
      );
      const html = ejs.render(template, {
        name: usercheck.name,
        lastname: usercheck.lastn,
        email: req.body.email,
        url: "http://skiesbook.com/reset-password/" + usercheck._id,
      });

      let info = await transporter.sendMail({
        from: "mohamedaziz.sahnoun@esprit..tn",
        to: req.body.email,
        subject: "Skiesbook Reset Password",
        html: html,
      });
      return res.status(200).json({ message: "email sent succefully" });
    } else {
      res.status(404).json({ message: "email not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while requesting password reset: " + error.message,
    });
  }
});

router.post("/resetpasswordrequest", async (req, res) => {
  const hashedpassword = await bcrypt.hash(req.body.password, 10);
  const updatePassword = await User.findByIdAndUpdate(
    req.body.id,
    { password: hashedpassword },
    {
      new: true,
    }
  );
  console.log(req.body);
  res.json({ message: "Password updated succesfully", status: 200 });
});

router.post("/addgstaff", upload.single("userimage"), async (req, res) => {
  const usercheck = await User.findOne({ email: req.body.email });
  if (usercheck !== null) {
    return res.status(401).json({ message: "EMAIL_EXISTS" });
  }
  const pass = req.body.password;
  //console.log(req.body);
  let rand = (Math.random() + 1).toString(36).substring(4);

  const hashedpassword = await bcrypt.hash(rand, 7);
  const myuser = req.body;
  myuser.password = hashedpassword;
  let myfile = "avatar.jpg";
  if (req.file) {
    myfile = req?.file.filename;
  }
  const registreduser = await User.create({
    name: req.body.name,
    lastn: req.body.lastn,
    Datebirth: req.body.Datebirth,
    email: req.body.email,
    password: req.body.password,
    sex: req.body.sex,
    role: req.body.role,
    userimage: myfile,
    graveyard: req.body.grave,
    phone: req.body.phone,
  });
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });
  const template = fs.readFileSync(
    path.resolve("./api/views", "sendgstaff.html"),
    {
      encoding: "utf-8",
    }
  );
  const html = ejs.render(template, {
    name: req.body.name,
    lastname: req.body.lastn,
    password: rand,
    email: req.body.email,
    grave: req.body.gname,
  });

  let info = await transporter.sendMail({
    from: process.env.EMAIL,
    to: req.body.email,
    subject: "Skiesbook",
    html: html,
  });
  res.json(registreduser);
});

router.post("/addastaff", upload.single("userimage"), async (req, res) => {
  const usercheck = await User.findOne({ email: req.body.email });
  if (usercheck !== null) {
    return res.status(401).json({ message: "EMAIL_EXISTS" });
  }
  //console.log(req.body);
  let rand = (Math.random() + 1).toString(36).substring(4);

  const hashedpassword = await bcrypt.hash(rand, 7);
  const myuser = req.body;
  myuser.password = hashedpassword;
  let myfile = "avatar.jpg";
  if (req.file) {
    myfile = req?.file.filename;
  }
  const registreduser = await User.create({
    name: req.body.name,
    lastn: req.body.lastn,
    Datebirth: req.body.Datebirth,
    email: req.body.email,
    password: req.body.password,
    sex: req.body.sex,
    role: req.body.role,
    userimage: myfile,
    phone: req.body.phone,
  });
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });
  const template = fs.readFileSync(
    path.resolve("./api/views", "sendgstaff.html"),
    {
      encoding: "utf-8",
    }
  );
  const html = ejs.render(template, {
    name: req.body.name,
    lastname: req.body.lastn,
    password: rand,
    email: req.body.email,
    grave: req.body.gname,
  });

  let info = await transporter.sendMail({
    from: process.env.EMAIL,
    to: req.body.email,
    subject: "Skiesbook",
    html: html,
  });
  res.json(registreduser);
});

router.post("/staffreporting/:id", async (req, res) => {
  try {
    const date1 = new Date(req.body.startDate);
    const date2 = new Date(req.body.endDate);
    const profile = await User.findById(req.params.id).populate({
      path: "clients",
      populate: {
        path: "graveyard",
      },
    });
    //filter created clients with date
    let clients = [];
    const filtredClients = profile.clients.map((client) => {
      if (client.createdAt >= date1 && client.createdAt <= date2) {
        clients.push(client);
      }
    });
    profile.clients = clients;
    console.log(profile);
    // console.log((filtredClients))
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/getadminbygrave/:id", async (req, res) => {
  try {
    const allUsers = await User.find({
      role: "admin",
      graveyard: req.params.id,
    }).populate("graveyard");
    res.json(allUsers[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.post("/gravestaffreporting/:id", async (req, res) => {
  try {
    const date1 = new Date(req.body.startDate);
    const date2 = new Date(req.body.endDate);
    const profile = await User.findById(req.params.id).populate("profiles");
    Date.prototype.addDays = function(days) {
      var date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
  }
    let clients = [];
    const filtredClients = profile.profiles.map((client) => {
      if (client.createdAt >= date1 && client.createdAt <= date2.addDays(1)) {
        clients.push(client);
      }
    });
    profile.profiles = clients;
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

module.exports = router;
