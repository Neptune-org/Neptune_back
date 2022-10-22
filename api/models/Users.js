const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const User = new Schema(
  {
    name: String,
    lastn: String,
    Datebirth: String,
    email: String,
    password: String,
    userimage: String,
    phone: String,
    sex: String,
    role: String,
    address: String,
    postalcode: String,
    active : {type : Number, default : -1},
    vendor : { type: Schema.Types.ObjectId, ref: "User" },
    graveyard: { type: Schema.Types.ObjectId, ref: "Graveyard" },
    profiles: [{ type: Schema.Types.ObjectId, ref: "Profile" }],
    clients: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sub : { type: Schema.Types.ObjectId, ref: "Price" },

  },
  { timestamps: true, versionKey: false }
);



module.exports = mongoose.model("User", User);