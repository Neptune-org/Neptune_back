const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const SibApiV3Sdk = require("sib-api-v3-sdk");

async function sendMail(id, name, email) {
  SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
    process.env.SENDINBLUE_API_KEY;
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
      params: { bodyMessage: "Welcome to skiesbook" + name },
    })
    .then(
      function (data) {
        console.log(data);
        return data;
      },
      function (error) {
        console.log(error);
        return error;
      }
    );
}

async function b2bMail(name) {
  SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
    process.env.SENDINBLUE_API_KEY;
  const template = fs.readFileSync(
    path.resolve("./api/views", "request.html"),
    {
      encoding: "utf-8",
    }
  );
  const html = ejs.render(template, {
    name: name,
  });
  new SibApiV3Sdk.TransactionalEmailsApi()
    .sendTransacEmail({
      subject: "Partnership request",
      sender: { email: "no-reply@skiesbook.com", name: "skiesbook" },
      replyTo: { email: "no-reply@skiesbook.com", name: "skiesbook" },
      to: [{ name: name, email: "no-reply@skiesbook.com" }],
      htmlContent: html,
      params: { bodyMessage: "Partnership request" + name },
    })
    .then(
      function (data) {
        console.log(data);
        return data;
      },
      function (error) {
        console.log(error);
        return error;
      }
    );
}

module.exports = {
  sendMail,
  b2bMail,
};
