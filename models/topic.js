const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var TopicSchema = new Schema({
  name: { type: String, minLength: 3, maxLength: 50 },
  description: { type: String, minLength: 3, maxLength: 300 },
  lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
});

module.exports = mongoose.model("Topic", TopicSchema);
