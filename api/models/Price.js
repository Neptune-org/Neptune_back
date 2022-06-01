const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Price = new Schema(
  {
    tag: String,
    price: Number,
  },

  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Price", Price);
