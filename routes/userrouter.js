var express = require("express");
var router = express.Router();

const { body, validationResult } = require("express-validator");

const jwt = require("jsonwebtoken");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { DateTime } = require("luxon");

// login
router.post("/login", function (req, res, next) {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        errors: ["unable to authenticate"],
      });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
      const token = jwt.sign({ user }, process.env.SECRET, {
        expiresIn: "20h",
      });
      return res.json({ token, id: user._id, admin: user.admin });
    });
  })(req, res);
});

// verify
router.get(
  "/verify",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.sendStatus(200);
  }
);

// get all
router.get("/", (req, res, next) => {
  User.find({}, "_id username admin").exec((err, results) => {
    if (err) {
      return res.sendStatus(400);
    } else {
      res.status(200).json({ users: results });
    }
  });
});

// CRUD
// create
router.post("/", [
  body("username").trim().isString().isLength({ min: 3, max: 30 }).exists(),
  body("email").trim().isEmail().isLength({ min: 3, max: 50 }).exists(),
  body("password").trim().isString().isLength({ min: 3, max: 2000 }).exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: ["Something went wrong with your request."] });
    } else {
      User.find({ username: req.body.username }).exec((err, result) => {
        if (err) {
          return res.status(400).json({ errors: ["Something went wrong."] });
        }
        if (result.length > 0) {
          return res
            .status(400)
            .json({ errors: ["The username is already taken."] });
        } else {
          User.find({ email: req.body.email }).exec((err, result) => {
            if (err) {
              return res
                .json(400)
                .json({ errors: ["an error occurred while checking email"] });
            } else if (result.length === 0) {
              bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
                const newUser = new User({
                  username: req.body.username,
                  email: req.body.email,
                  password: hashedPassword,
                  joindate: DateTime.now(),
                });

                newUser.save((err) => {
                  if (err) {
                    return res.status(400).json({
                      errors: ["an error occurred while creating your account"],
                    });
                  } else {
                    return res.sendStatus(200);
                  }
                });
              });
            } else {
              return res.status(400).json({
                errors: ["Email is already used. Please use another."],
              });
            }
          });
        }
      });
    }
  },
]);

// read
router.get("/:id", (req, res, next) => {
  User.findById(req.params.id).exec((err, result) => {
    if (err) {
      return res.sendStatus(400);
    }
    if (result) {
      return res.status(200).json({
        username: result.username,
        id: result._id,
        admin: result.admin,
      });
    } else {
      res.status(400).json({ message: "User not found" });
    }
  });
});

// update
router.put("/:id", passport.authenticate("jwt", { session: false }), [
  body("username").trim().isString().isLength({ min: 3, max: 30 }).exists(),
  body("email").trim().isEmail().isLength({ min: 3, max: 50 }).exists(),
  body("password").trim().isString().isLength({ min: 3, max: 2000 }).exists(),
  body("newPassword")
    .trim()
    .isString()
    .isLength({ min: 3, max: 2000 })
    .exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      let updatedInfo = {};
      User.findById(req.params.id).exec((err, result) => {
        if (err) {
          return res.status(400).json({
            message: "An error occurred while searching for the user.",
          });
        } else if (result) {
          bcrypt.compare(
            req.body.password,
            result.password,
            (err, verified) => {
              if (err) {
                return res.status(400).json({
                  message: "An error occurred while setting the new password",
                });
              }
              if (verified) {
                if (req.body.newPassword && req.body.newPassword !== "") {
                  bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
                    if (err) {
                      return res.status(400).json({
                        message: "An error occurred while updating the user.",
                      });
                    } else {
                      updatedInfo.password = hash;
                      if (req.body.email && req.body.email !== "") {
                        updatedInfo.email = req.body.email;
                      }

                      User.findByIdAndUpdate(
                        req.params.id,
                        updatedInfo,
                        (err) => {
                          if (err) {
                            return res.status(400).json({
                              message:
                                "An error occurred while updating the user.",
                            });
                          } else {
                            return res
                              .status(200)
                              .json({ message: "User information updated." });
                          }
                        }
                      );
                    }
                  });
                }
              } else {
                return res.status(400).json({ message: "Incorrect password" });
              }
            }
          );
        } else {
          return res.status(400).json({
            message: "An error occurred. A user with this id may not exist.",
          });
        }
      });
    }
  },
]);

// delete
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const userToken = req.headers.authorization;
    const token = userToken.split(" ");
    const decoded = jwt.verify(token[1], process.env.SECRET);
    if (decoded.user._id !== req.params.id) {
      return res
        .status(400)
        .json({ errors: ["You can only delete your own account."] });
    } else {
      User.findByIdAndDelete(decoded.user._id).exec((err) => {
        if (err) {
          return res.status(400).json({
            errors: ["something went wrong while deleting your account"],
          });
        } else {
          return res.sendStatus(200);
        }
      });
    }
  }
);

module.exports = router;
