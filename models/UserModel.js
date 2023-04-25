const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const user = require("../controllers/userController");
const userErrors = {
  notfound: {
    success: false,
    code: 4000,
    message: "user not found",
  },
  duplicate: {
    success: false,
    code: 4001,
    message: "user already exists",
  },
  invalidPass: {
    success: false,
    code: 4002,
    message: "user password is invalid",
  },
  authReq: {
    success: false,
    code: 4003,
    message: "No access token provided",
  },
  default: {
    success: false,
    code: 4999,
    message: "Unrecognized error",
  },
};

const USER_TYPES = {
  CONSUMER: "consumer",
  SUPPORT: "support",
};

const USER_GENDERS = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    firstName: String,
    lastName: String,
    gender: String,
    age: String,
    type: String,
    email: {
      type: String,
      unique: true,
    },
    password: String,
  },
  {
    timestamps: true,
    collection: "users",
  }
);
userSchema.statics.createUser = function (
  firstName,
  lastName,
  type,
  gender,
  age,
  email,
  password
) {
  const user = this({
    firstName,
    lastName,
    type,
    gender,
    age,
    email,
    password,
  });

  const userPromise = new Promise((resolve, reject) => {
    // user.save((err, user) => {
    //   if (err) {
    //     reject(err);
    //   } else {
    //     resolve(user);
    //   }
    // });
    user
      .save()
      .then((user) => {
        resolve(user);
      })
      .catch((err) => {
        reject(err);
      });
  });
  return userPromise;
};
userSchema.statics.getUsers = function () {
  const users = this.find().exec();
  return users;
};
userSchema.statics.getUserById = function (id) {
  const user = this.findOne({ _id: id }).exec();
  return user;
};
userSchema.statics.getUserByIds = async function (ids) {
  const users = await this.find({ _id: { $in: ids } }).exec();
  return users;
};
userSchema.statics.getUserByEmail = function (email) {
  const user = this.findOne({ email: email }).exec();
  user.then((user) => {
    console.log("MODEL: ", user);
  });
  return user;
};

userSchema.statics.deleteByUserById = function (id) {
  const result = this.deleteOne({ _id: id }).exec();
  return result;
};

userSchema.statics.getUserByIds = async function (ids) {
  try {
    const users = await this.find({ _id: { $in: ids } });
    return users;
  } catch (error) {
    throw error;
  }
};
const UserModel = mongoose.model("User", userSchema);

module.exports = { USER_TYPES, USER_GENDERS, userErrors, UserModel };
