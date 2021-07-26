const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LessonSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  description: { type: String, required: true, minLength: 3, maxLength: 300 },
  sections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
});

module.exports = mongoose.model("Lesson", LessonSchema);
