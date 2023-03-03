const mongoose = require('mongoose');
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const rootDir = require("./util/path");
const session = require('express-session');
const csrf = require('csurf');
const multer = require("multer");
// const flash = require('connect-flash');
const MongoDBStore=require('connect-mongodb-session')(session);
const User = require("./models/user");
const errors = require('./controllers/errors');


mongoDB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ctt83yi.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

const app = express();

const store = new MongoDBStore({
    uri: mongoDB_URI,
    collection:'sessions'
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    }
    else {
        console.log("not Image");
        cb(null, false)
    }
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer({storage:fileStorage , fileFilter:fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images",express.static(path.join(__dirname, "images")));
// app.use(flash());
app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

// app.use(csrfProtection);

//router
const shopRouter=require('./routes/shop.js')
const productRouter = require("./routes/v1");
const authRouter = require("./routes/auth");
const { log, Console } = require('console');

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            throw new Error(err);
    })
    
    

});

//CSRF TOKEN
// app.use((req, res, next) => {
//     res.locals.isAuthenticated = req.session.isloggedin;
//     res.locals.csrfToken = req.csrfToken();
//     next();
// });


app.use("/api/v1", productRouter);
app.use("/auth", authRouter);
app.use("/", shopRouter);


app.get("/500", errors.get500);

app.use(errors.get404);

app.use((error, req, res, next) => {
    // res.status(error.httpStatusCode).render(...);
    res.status(500).json( {
        status: "fail",
        msg: error.message,
    });
});


mongoose
    .connect(mongoDB_URI)
    .then(result => {
        port = process.env.PORT || 7000;
        app.listen(port, () => {
            console.log("Server Running...");
        });
            console.log("DB connected...");
        }
    )
    .catch(err => console.log(err));

