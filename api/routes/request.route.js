const express = require("express");
const router = express.Router();
const Request = require("../models/Requests");
const User = require("../models/Users");
const Graveyard = require("../models/Graveyard");
const { b2bMail, sendMail } = require("../utils/mail");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  try {
    const request = await Request.create(req.body);
    b2bMail(req.body.name + " " + req.body.lastn);
    res.json(request);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.post("/note/:id", async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(req.params.id, {
      note: req.body.note,
    });
    res.json(request);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.get("/", async (req, res) => {
  try {
    const request = await Request.find();
    res.json(request.reverse());
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.post("/accept/:id", async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(req.params.id, {
      state: "accepted",
    });
    const usercheck = await User.findOne({ email: req.body.email });
    if (usercheck !== null) {
      return res.status(401).json({ message: "EMAIL_EXISTS" });
    }

    let rand = (Math.random() + 1).toString(36).substring(7);
    const hashedpassword = await bcrypt.hash(rand, 10);

    const address =
      request.address +
      ", " +
      request.ville +
      ", " +
      request.region +
      ", " +
      request.country +
      ", " +
      request.zip;

    const mygraveyard = {
      name: request.graveyardName,
      address: address,
      email: request.email,
    };
    const registreduser = await Graveyard.create(mygraveyard).then((d) => {
      let myfile = "avatar.jpg";
      if (req.file) {
        myfile = req?.file.filename;
      }
      User.create({
        name: request.name,
        lastn: request.lastn,
        email: request.email,
        password: hashedpassword,
        role: "admin",
        userimage: myfile,
        graveyard: d._id,
        phone: request.phone,
      }).then(async (k) => {
        sendMail(k._id, request.name, request.email);
      });
    });
    res.json(registreduser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

module.exports = router;
