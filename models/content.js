const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContentSchema = new Schema({
  name: { type: String, required: true },
  pageurl: { type: String, required: true },
});

module.exports = mongoose.model("Content", ContentSchema);
