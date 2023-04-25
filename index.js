const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./config/app");

const CONNECTION_URL = `mongodb://${config.db.url}/${config.db.name}`;

mongoose.connect(CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Mongo has connected successfully");
});
mongoose.connection.on("reconnected", () => {
  console.log("Mongo has reconnected");
});

mongoose.connection.on("error", (error) => {
  console.log("Mongo connection has an error", error);
  mongoose.disconnect();
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongo connection is disconnected");
});

// routes
const indexRouter = require("./routes/indexRoute");
const userRouter = require("./routes/userRoute");
// middlewares
const { decode } = require("./middlewares/jwt");

const app = express();
const port = process.env.PORT || "3000";

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/", indexRouter);
app.use("/users", decode, userRouter);

/** catch 404 and forward to error handler */
app.use("*", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint doesnt exist",
  });
});

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
