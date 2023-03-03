const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator');
const User = require("../models/user.js");

const authController = require('../controllers/auth');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post("/signup",
    [
        check("email").isEmail().trim()
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then((userDoc) => {
                        if (userDoc) {
                            return Promise.reject("this Email is exits");
                        }
                    })
            })
        , check("name")
            .custom((value, { req }) => {
                return User.findOne({ name: value })
                    .then((userDoc) => {
                        if (userDoc) {
                            return Promise.reject("this username is exits");
                        }
                    })
            })
        , body("password").isLength({ min: 4 }).trim()
        , body("confirmPassword").custom((value, { req }) => {
            if (value !== req.body.password) {
                console.log("value : ", value);
                console.log("req.body.password : ", req.body.password);
                throw new Error("passwords have to match")
            }
            return true;
        })
    ],
    authController.signup
);
router.post("/reset", authController.resetPassword);
router.post("/new-password", authController.postNewPassword);
router.get("/reset/:token", authController.getNewPassword);


module.exports = router;
