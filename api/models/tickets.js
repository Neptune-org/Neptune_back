const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Ticket = new Schema(
  {
    prop: { type: Schema.Types.ObjectId, ref: "User" },
    subject: String,
    messages: [{ msg: String, send: Number,timestamp: { type: Date, default: Date.now }, sender: { type: Schema.Types.ObjectId, ref: "User" } }],
    status: {type : String, default: "open"},
    files : String
    
  },

  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Ticket", Ticket);
