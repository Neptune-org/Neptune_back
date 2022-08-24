const express = require("express");
const nodemailer = require("nodemailer");
var router = express.Router();
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

router.post("/mail-text/:mail", async (req, res) => {
  try {
    const mail = req.params.mail;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      auth: {
        user: "no-reply@skiesbook.com",
        pass: "vfkuwoafolzkkady",
      },
    });
    await transporter.sendMail({
      from: "no-reply@skiebook.com",
      to: mail,
      subject: "Salut",
      text: req.body.text,
    });
    res.json({ message: "done" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

router.post("/mail-ejs", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mohamedaziz.sahnoun@esprit.tn",
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
    });

    let info = await transporter.sendMail({
      from: "mohamedaziz.sahnoun@esprit.tn",
      to: req.body.email,
      subject: "Hello <3",
      html: html,
    });
    // 4. send respone
    res.json({ message: "done" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});
router.post("/attachement-ejs", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mohamedaziz.sahnoun@esprit.tn",
        pass: process.env.PASS,
      },
    });

    const template = fs.readFileSync(path.resolve("./views", "sendmail.html"), {
      encoding: "utf-8",
    });
    const html = ejs.render(template, {
      name: req.body.name,
    });

    let info = await transporter.sendMail({
      from: "mohamedaziz.sahnoun@esprit.tn",
      to: "mohamedaziz.sahnoun@esprit.tn",
      subject: "test mailing via ejs",
      html: html,
      attachments: [
        {
          filename: "filename.png",
          path: path.resolve("./public/logo.png"),
        },
      ],
    });
    // 4. send respone
    res.json({ message: "done" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
});

module.exports = router;
