const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const SibApiV3Sdk = require("sib-api-v3-sdk");

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

router.post("/test", async (req, res) => {
  SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
    "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";
  const template = fs.readFileSync(
    path.resolve("./api/views", "testmail.html"),
    {
      encoding: "utf-8",
    }
  );
  // date tomorrow timestamp
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimestamp = tomorrow.getTime() / 1000;



  const html = ejs.render(template, {
    name: req.body.name,
    id: req.body.id,
    timestamp: tomorrowTimestamp,
  });
  new SibApiV3Sdk.TransactionalEmailsApi()
    .sendTransacEmail({
      subject: "Welcome to skiesbook",
      sender: { email: "no-reply@skiesbook.com", name: "skiesbook" },
      replyTo: { email: "no-reply@skiesbook.com", name: "skiesbook" },
      to: [{ name: "req.body.name", email: "mohamedaziz.sahnoun@esprit.tn" }],
      htmlContent: html,
      params: { bodyMessage: "Made just for you!" },
    })
    .then(
      function (data) {
        console.log(data);
      },
      function (error) {
        res.send(error);
      }
    );
});

router.post("/mail-ejs", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mohamedaziz.sahnoun@esprit.tn",
        pass: "thebigredone5",
      },
    });
    const template = fs.readFileSync(
      path.resolve("./api/views", "testmail.html"),
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
