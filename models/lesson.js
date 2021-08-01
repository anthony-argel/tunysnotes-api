const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LessonSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  description: { type: String, required: true, minLength: 3, maxLength: 300 },
  contents: [{ type: Schema.Types.ObjectId, ref: "Content" }],
});

module.exports = mongoose.model("Lesson", LessonSchema);
