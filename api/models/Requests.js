const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Request = new Schema(
  {
    name: String,
    lastn: String,
    email: String,
    userimage: { type: String, default: "avatar.jpg" },
    graveyardName: String,
    state: { type: String, default: "pending" },
    phone: String,
    email: String,
    note : String,
    address: String,
    country: String,
    ville: String,
    region: String,
    zip: String,
    active: { type: Number, default: -1 },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Request", Request);
