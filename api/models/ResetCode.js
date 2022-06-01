const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResetCode = new Schema({
    Email: String,
    Code:String
});


module.exports = mongoose.model("resetCode", ResetCode);