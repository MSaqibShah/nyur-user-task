const makeValidation = require("../utils/validation");
const {
  USER_TYPES,
  USER_GENDERS,
  userErrors,
  UserModel,
} = require("../models/UserModel");
const { copyFromDict } = require("../utils/maintainance");
// const { handleUserError } = require("../errors/user");
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = {
  onGetAllUsers: (req, res) => {
    const users = UserModel.getUsers();
    users
      .then((users) => {
        data = [];
        users.forEach((user) => {
          const { password, ...user_data } = user._doc;
          data.push(user_data);
        });
        return res.status(200).json({ success: true, data: data });
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json(userErrors["default"]);
      });
  },
  onGetUserById: (req, res) => {
    const user = UserModel.getUserById(req.params.id)
      .then((user) => {
        if (user == null) {
          return res.status(500).json(userErrors["notfound"]);
        } else {
          const { password, ...data } = user._doc;
          console.log(data);
          return res.status(200).json({ success: true, data: data });
        }
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json(userErrors["default"]);
      });
    // return res.status(500).json({ success: false, error: error });
  },
  onCreateUser: (req, res) => {
    const checks = {
      firstName: { type: "string", isRequired: true },
      lastName: { type: "string", isRequired: true },
      type: {
        type: "enum",
        values: ["consumer", "admin", "user"],
        isRequired: true,
      },
      gender: {
        type: "enum",
        values: ["male", "female", "other"],
        isRequired: true,
      },
      age: {
        type: "String",
        isRequired: true,
      },
      email: { type: "string", isRequired: true },
      password: { type: "string", isRequired: true },
    };

    const validation = makeValidation(req.body, checks);
    if (!validation.success) {
      return res.status(400).json(validation);
    }

    const { firstName, lastName, type, gender, age, email, password } =
      req.body;

    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) {
        console.log(err);
        return res.status(500).json(userErrors["default"]);
      }
      const user = UserModel.createUser(
        firstName,
        lastName,
        type,
        gender,
        age,
        email,
        hash
      )
        .then((user) => {
          const data = copyFromDict(user, [
            "firstname",
            "lastName",
            "gender",
            "age",
            "type",
            "email",
            "_id",
            "createdAt",
            "updatedAt",
          ]);
          return res.status(200).json({ success: true, data });
        })
        .catch((error) => {
          console.log(error);
          if (error.code == 11000) {
            return res.status(500).json(userErrors["duplicate"]);
          } else {
            return res.status(500).json(userErrors["default"]);
          }
        });
    });
  },
  onDeleteUserById: (req, res) => {
    const user = UserModel.deleteByUserById(req.params.id);
    user.then((result) => {
      if (result["deletedCount"] != 0) {
        return res.status(200).json({
          success: true,
          message: `Deleted a count of ${result.deletedCount} user.`,
          data: {
            id: req.params.id,
          },
        });
      } else {
        return res.status(500).json(userErrors["default"]);
      }
    });
  },
  onGetUserByEmailAndCheckPassword: (req, res) => {
    const user = UserModel.getUserByEmail(req.params.email)
      .then((user) => {
        if (user == null) {
          return res.status(500).json(userErrors["notfound"]);
        } else {
          const user = user._doc;
          // Check password
          if (user.password === req.user.password) {
            return user;
          } else {
            return res.status(500).json(userErrors["invalidPass"]);
          }
        }
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json(userErrors["default"]);
      });
  },
};
