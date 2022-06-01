const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Graveyard = new Schema(
  {
    name: String,
    funeral_home:String, 
    email: String,
    address: String,
    image: String,
    Lng: String,
    Lat: String,
    area: String,
    users: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    persons: [{ type: Schema.Types.ObjectId, ref: "Profile" }],
    staff: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    sub : { type: Schema.Types.ObjectId, ref: "Price" },
    
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Graveyard", Graveyard);
