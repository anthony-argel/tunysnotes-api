const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestResultSchema = new Schema({
  test: { type: Schema.Types.ObjectId, ref: "Test" },
  score: { type: Number },
});

module.exports = mongoose.model("TestResult", TestResultSchema);
