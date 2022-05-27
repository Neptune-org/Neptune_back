var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Profile = new Schema(
  {
    profileName: String,
    profileLastName: String,
    gender: String,
    profileDatebirth: String,
    profileDatedeath: String,
    hometown: String,
    hobbies: String,
    quotes: String,
    memorialGift: String,
    H_W: String, //husband wife
    B_S: String, // brothers sisters
    parents: String,
    grand_parenst: String,
    banner: String,
    profileImage:String,
    bio: String,
    cords: String, // Funérailles cords
    modeDeath: String, //  Modes de funérailles
    profileEmail: String,
    files: [String],
    active : { type: Number, default: 0 },
    graveyard: { type: Schema.Types.ObjectId, ref: "Graveyard" },
  },

  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Profile", Profile);
