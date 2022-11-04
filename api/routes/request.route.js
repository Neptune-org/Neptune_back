const express = require("express");
const router = express.Router();
const Request = require("../models/Requests");
const { b2bMail } = require("../utils/mail");

router.post("/", async (req, res) => {
  try {
    const request = await Request.create(req.body);
    console.log(req.body)
    b2bMail(req.body.name + " " + req.body.lastn);
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

module.exports = router;
