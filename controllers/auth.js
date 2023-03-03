const crypto = require('crypto');
const bcrypt = require("bcryptjs");
const User = require('../models/user.js');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const { validationResult}=require('express-validator')
const { readdirSync } = require('fs');
const { log } = require('console');


const transport = nodemailer.createTransport(sgTransport({
    auth: {
        api_key:'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'
    }
}))




exports.login = (req, res, next) => {
    const name = req.body.name;
    const password = req.body.password;
    
    User.findOne({ name: name })
        .then(user => {
            if (!user) {
                return res.json({
                    status: "fail",
                    message: "User not found"
                })
            }
            console.log('password : ', password);
            console.log('user.password : ', user.password);
            bcrypt.compare(password, user.password)
                .then((match) => {
                        console.log("match : ", match);
                    if (match) {
                        req.session.isloggedin = true;
                        req.session.user = user;
                        return req.session.save();
                    }
                    // else {
                    res.json({
                        status: "fail",
                        message: "password is incorrect",
                    });
                    // }
                }).then(success => {
                    res.redirect('/');

                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch(err => { console.log(err); });
}




exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
    });
    res.redirect("/");
}




exports.signup = (req, res, next) => {
    const name = req.body.name
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({
            status: 'error',
            msg: errors.array()[0].msg
        })
    }
    console.log("signup : ", req.body);
    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                name: name,
                email: email,
                password: hashedPassword,
                cart: { items: [] },
            });
            return user.save();
        })
        // .then((newUser) => {
        //     console.log(newUser);
        //     userForSession=newUser
        //     return transport.sendMail({
        //         to: email,
        //         from: "ibrahimabdalr7man@gmail.com",
        //         subject: "signup successful",
        //         html: "<h1>welcome to electronix-store </h1>",
        //     });
        // })
        .then((newUser) => {
            console.log("--------------------", newUser);
            req.session.isloggedin = true;
            req.session.user = newUser;
            return req.session.save();
        })
        .then(
            res.redirect("/")
        )
        .catch((err) => {
            console.log("ERROR IN SIGNUP", err);
        });
};



exports.resetPassword = (req,res,next) => {
    crypto.randomBytes(4, (err, buffer) => {
        if (err) {
            res.json({
                status: 'fail',
                msg: err.message,
            })
        }
        const token = buffer.toString("hex");
        User.findOne({ email: req.body.email })
            .then(user => {
                console.log(user);
                if (!user) {
                    return res.json({
                        status: 'fail',
                        msg: 'No Account with that email'
                    });
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                console.log(result);
                return transport.sendMail({
                    to: req.body.email,
                    from: "ibrahimabdalr7man@gmail.com",
                    subject: "password reset",
                    html: `<p>check this link to update your password :  ${token} . <p>`,
                });
            }).then(() => {
                console.log("done password");
                return res.json({
                  status: "success",
                  msg: "Reset Password",
                });
            })
            .catch(err => { console.log(err); })
    })
}


exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                res.json({
                    status: 'fail',
                    msg: 'error in code , please check your email'
                });
            }
            res.json({
                status: 'success',
                data : user
            })
        })
        .catch(err => { logger.error(err) });
};



exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const passwordToken = req.body.token;
    let resetUser;
    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = null;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save()
        })
        .then(result => {
            res.json({
                status: 'success',
                msg: 'updated password successfully',
                data: result
            })
        })
        .catch(err => { console.log(err); });
};






