
import { Schema, model } from "mongoose";

const UserSchema = new Schema({
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
  email: {
    type: String,
    unique: true,
    required: true
  },
  coins: {
    type: Number,
    default: 5000,
  }
});

const UserModel = model("users", UserSchema);

export default UserModel;