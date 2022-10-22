
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const SibApiV3Sdk = require("sib-api-v3-sdk");

async function sendMail(id,name,email) {
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
  console.log(id)
    const html = ejs.render(template, {
      name: name,
      id: id,
      timestamp: tomorrowTimestamp,
    });
    new SibApiV3Sdk.TransactionalEmailsApi()
      .sendTransacEmail({
        subject: "Welcome to skiesbook",
        sender: { email: "no-reply@skiesbook.com", name: "skiesbook" },
        replyTo: { email: "no-reply@skiesbook.com", name: "skiesbook" },
        to: [{ name: name, email: email }],
        htmlContent: html,
        params: { bodyMessage: "Welcome to skiesbook" },
      })
      .then(
        function (data) {
          return data
        },
        function (error) {
          return error
        }
      );
  };

  module.exports = {
    sendMail,
  };
        