const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Graveyard = new Schema(
  {
    name: String,
    funeral_home: String,
    email: String,
    address: String,
    image: String,
    Lng: String,
    Lat: String,
    area: String,
    plan: String,
    clients: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    persons: [{ type: Schema.Types.ObjectId, ref: "Profile" }],
    staff: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    places: [{ code: String, lat: String, lng: String }],
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Graveyard", Graveyard);
