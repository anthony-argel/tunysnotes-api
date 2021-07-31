const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Lesson = require("../models/lesson");
const Section = require("../models/section");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// CR only

// Read
router.get("/:id", (req, res) => {
  Lesson.findById(req.params.id)
    .populate("sections sections.content")
    .exec((err, result) => {
      if (err) return res.sendStatus(404);
      else res.status(200).json({ data: result });
    });
});

// Create section
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
      new Section({
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
router.post("/:id", passport.authenticate("jwt", { session: false }), [
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

    new Section({
      name: req.body.name,
      description: req.body.description,
    }).save((err, newSection) => {
      if (err) {
        return res.sendStatus(400);
      }
      Lesson.findOneAndUpdate(
        { _id: req.params.id },
        {
          $addToSet: {
            sections: newSection._id,
          },
        }
      ).exec((err) => {
        if (err) return res.sendStatus(400);
        res.sendStatus(200);
      });
    });
  },
]);

module.exports = router;
