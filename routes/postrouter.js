const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// blog posts
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const userToken = req.headers.authorization;
    const token = userToken.split(" ");
    const decoded = jwt.verify(token[1], process.env.SECRET);
    if (decoded.user.admin !== true) {
      return res.sendStatus(403);
    }
    const newPost = new Post({
      title: req.body.title,
      post: req.body.post,
    }).save((err, result) => {
      if (err) {
        return next(err);
      }
      res.json({ message: "posted!" });
    });
  }
);

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const updateData = {};
    if (req.body.post !== "") {
      updateData.post = req.body.post;
    }
    if (req.body.title !== "") {
      updateData.title = req.body.title;
    }
    const userToken = req.headers.authorization;
    const token = userToken.split(" ");
    const decoded = jwt.verify(token[1], process.env.SECRET);
    if (decoded.user.admin !== true) {
      return res.sendStatus(403);
    }
    Post.findByIdAndUpdate(req.params.id, updateData, (err, result) => {
      if (err) {
        return next(err);
      } else {
        res.status(200).json({ message: "success" });
      }
    });
  }
);

module.exports = router;
