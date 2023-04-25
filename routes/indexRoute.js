const express = require("express");
// controllers
const user = require("../controllers/userController.js");
// middlewares
const { encode } = require("../middlewares/jwt.js");

const router = express.Router();

router.post("/login/", encode, (req, res, next) => {
  return res.status(200).json({
    success: true,
    authorization: req.authToken,
  });
});

router.post("/register/", user.onCreateUser);

module.exports = router;
