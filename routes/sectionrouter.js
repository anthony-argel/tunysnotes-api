const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Content = require("../models/content");
const Section = require("../models/section");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// Read
router.get("/:id", (req, res) => {
  Section.findById(req.params.id)
    .populate("contents")
    .exec((err, result) => {
      if (err) return res.sendStatus(404);
      else res.status(200).json({ data: result });
    });
});

// add content
router.post(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  [
    body("name").exists().isString(),
    body("contentid").exists().isString(),
    body("contenttype").exists().isString().isIn(["POST", "TEST", "FLASHCARD"]),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    new Content({
      name: req.body.name,
      contenttype: req.body.contenttype,
      contentid: req.body.contentid,
    }).save((err, newContent) => {
      if (err) return res.sendStatus(400);
      Section.findOneAndUpdate(
        { _id: req.params.id },
        {
          $addToSet: {
            contents: newContent._id,
          },
        }
      ).exec((er1) => {
        if (er1) return res.sendStatus(400);
        res.sendStatus(200);
      });
    });
  }
);

module.exports = router;
