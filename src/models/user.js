const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const moment = require("moment-timezone");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  userPassword: {
    type: String,
    required: false
  },
  userEmail: {
    type: String,
    unique: true,
    required: true
  },
  userPhone: {
    type: String,
    unique: true,
    required: true
  },
  resetPasswordToken: {
    type: String,
    default: "Null",
    required: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  userProfilePicLink: {
    type: String,
    required: false
  },
  userProfilePicName: {
    type: String,
    required: false
  },
  userProfilePicActualName: {
    type: String,
    required: false
  },
  createdAt: {
    type: String,
    default: moment()
      .tz("Africa/Windhoek")
      .format("LLL")
  }
});

userSchema.pre("save", async function(next) {
  const user = this;
  if (user.isModified("userPassword")) {
    user.userPassword = await bcrypt.hash(user.userPassword, 8);
  }
  next();
});

module.exports = mongoose.model("users", userSchema);
