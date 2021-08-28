var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var User = new Schema(
  {
    Id: String,
    Username: String,
    Firstname: String,
    Lastname: String,
    Vehicule: String,
    Phone: String,
    Date_birth: Date,
    Cin: String,
    Password: String,
    Email: String,
    Role: String,
    img: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", User);
