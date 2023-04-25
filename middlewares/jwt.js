const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/UserModel");
const makeValidation = require("../utils/validation");
SECRET_KEY = "HERE-is-my-totally-secret-key";

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
  invalidAuthToken: {
    success: false,
    code: 4004,
    message: "auth token is not valid",
  },
  default: {
    success: false,
    code: 4999,
    message: "Unrecognized error",
  },
};

const encode = (req, res, next) => {
  const { email, password } = req.body;
  const checks = {
    email: { type: "string", isRequired: true },
    password: { type: "string", isRequired: true },
  };
  const validation = makeValidation(req.body, checks);
  if (!validation.success) {
    return res.status(400).json(validation);
  }

  const user = UserModel.getUserByEmail(email).then((user) => {
    console.log("JWT: ", user);
    if (user == null) {
      return res.status(500).json(userErrors["notfound"]);
    } else {
      // User found
      // check password
      if (user["password"] !== password) {
        return res.status(500).json(userErrors["invalidPass"]);
      } else {
        const payload = {
          userId: user._id,
          userType: user.type,
        };
        const authToken = jwt.sign(payload, SECRET_KEY);
        // console.log("Auth", authToken);
        req.authToken = authToken;
        next();
      }
    }
  });
};

const decode = (req, res, next) => {
  if (!req.headers["authorization"]) {
    return res.status(400).json(userErrors["authReq"]);
  }
  const accessToken = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(accessToken, SECRET_KEY);
    req.userId = decoded.userId;
    req.userType = decoded.type;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(401).json(userErrors["invalidAuthToken"]);
  }
};

module.exports = { encode, decode };
