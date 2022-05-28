var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var User = new Schema(
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
    vendor : { type: Schema.Types.ObjectId, ref: "User" },
    graveyard: { type: Schema.Types.ObjectId, ref: "Graveyard" },
    profiles: [{ type: Schema.Types.ObjectId, ref: "Profile" }],
    clients: [{ type: Schema.Types.ObjectId, ref: "User" }],

  },
  { timestamps: true, versionKey: false }
);



module.exports = mongoose.model("User", User);