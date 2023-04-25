const express = require("express");
// controllers
const user = require("../controllers/userController");
const router = express.Router();

router
  .get("/", user.onGetAllUsers)
  .get("/:id", user.onGetUserById)
  .delete("/:id", user.onDeleteUserById);

module.exports = router;
