const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Topic = require("../models/topic");
const Lesson = require("../models/lesson");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// CR only

// Read
router.get("/:name", (req, res) => {
  Topic.find({ name: req.params.name })
    .collation({ locale: "en", strength: 2 })
    .populate("lessons lessons.section")
    .exec((err, result) => {
      if (err) return res.sendStatus(404);
      res.status(200).json({ data: result[0] });
    });
});

// Create
router.post("/", passport.authenticate("jwt", { session: false }), [
  body("name").isString().isLength({ min: 3, max: 50 }).exists(),
  body("description").isString().isLength({ min: 3, max: 300 }).exists(),
  (req, res) => {
    const userToken = req.headers.authorization;
    const token = userToken.split(" ");
    const decoded = jwt.verify(token[1], process.env.SECRET);
    if (decoded.user.admin !== true) {
      return res.sendStatus(403);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      new Topic({
        name: req.body.name,
        description: req.body.description,
      }).save((err) => {
        if (err) {
          return res
            .status(400)
            .json({ errors: ["an error occurred while saving the new topic"] });
        } else {
          res.sendStatus(200);
        }
      });
    }
  },
]);

// Add section
router.post("/:name", [
  body("name").exists().isString().isLength({ min: 3, max: 100 }),
  body("description")
    .exists()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 3, max: 300 })
    .withMessage("Description must be between 3-300 length long."),
  (req, res) => {
    const userToken = req.headers.authorization;
    const token = userToken.split(" ");
    const decoded = jwt.verify(token[1], process.env.SECRET);
    if (decoded.user.admin !== true) {
      return res.sendStatus(403);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    Topic.find({ name: req.params.name })
      .collation({ locale: "en", strength: 2 })
      .exec((err, result) => {
        if (err) {
          return req.sendStatus(400);
        }
        new Lesson({
          name: req.body.name,
          description: req.body.description,
        }).save((err, newLesson) => {
          if (err) {
            return res.sendStatus(400);
          }
          Topic.findOneAndUpdate(
            { _id: result[0]._id },
            {
              $addToSet: {
                lessons: newLesson._id,
              },
            }
          ).exec((err) => {
            if (err) return res.sendStatus(400);
            res.sendStatus(200);
          });
        });
      });
  },
]);

module.exports = router;
