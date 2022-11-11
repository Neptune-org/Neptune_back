const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Profile = new Schema(
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
    profileImage: String,
    bio: String,
    albums: [{ name: String, images: [String] }],
    friends: [
      { lien: String, prof: { type: Schema.Types.ObjectId, ref: "Profile" } },
    ],
    invitationsout: [
      { lien: String, prof: { type: Schema.Types.ObjectId, ref: "Profile" } },
    ],
    invitationsin: [
      { lien: String, prof: { type: Schema.Types.ObjectId, ref: "Profile" } },
    ],
    timeline: [{ message: String, date: String }],
    cords: String, // Funérailles cords
    modeDeath: String, //  Modes de funérailles
    profileEmail: String,
    comments: [
      {
        message: String,
        timestamp: { type: Date, default: Date.now },
        sender: String,
        email: String,
        images: [String],
        likes: 0,
        state: { type: Number, default: 0 },
      },
    ],
    files: [String],
    active: { type: Number, default: 0 },
    graveyard: { type: Schema.Types.ObjectId, ref: "Graveyard" },
    position : {lat : String, lng : String},
  },

  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Profile", Profile);
