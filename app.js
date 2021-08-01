require("dotenv").config();
require("./passport");
var createError = require("http-errors");
var helmet = require("helmet");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var mongoose = require("mongoose");
var mongoDB = process.env.DB_URL;
var compression = require("compression");
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useFindAndModify", false);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// routes
var indexRouter = require("./routes/index");
var userRouter = require("./routes/userrouter");
const topicRouter = require("./routes/topicrouter");
const lessonRouter = require("./routes/lessonrouter");
const postRouter = require("./routes/postrouter");

var app = express();

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/topic", topicRouter);
app.use("/lesson", lessonRouter);
app.use("/post", postRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
