const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContentSchema = new Schema({
  name: { type: String, required: true },
  contenttype: {
    type: String,
    enum: ["POST", "TEST", "FLASHCARD"],
    required: true,
  },
  contentid: { type: String, required: true },
});

module.exports = mongoose.model("Content", ContentSchema);
