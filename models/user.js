const Mongoose = require("mongoose");
const UserSchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 4,
    required: true,
  },
  coins: {
    type: Number,
    default: 5000,
  }
});

const User = Mongoose.model("users", UserSchema);
module.exports = User;