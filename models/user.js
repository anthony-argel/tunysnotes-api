const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, minLength: 3, maxLength: 100 },
  username: { type: String, required: true, minLength: 3, maxLength: 100 },
  password: { type: String, required: true, minLength: 12, maxLength: 1000 },
  testResults: [],
  admin: { type: Boolean, default: false, required: true },
});

module.exports = mongoose.model("User", UserSchema);
