const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { regex } = require("./schema.js");


main()
    .then(() => {
        console.log("connection to DB successfully");
    })
    .catch((err) => {
        console.log(err);
    });

    async function main() {
        await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
    };

    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");
    app.use(express.urlencoded({extended: true}));
    app.use(methodOverride("_method"));
    app.engine("ejs", ejsMate)
    app.use(express.static(path.join(__dirname, "public")));

    const sessionOptions = {
        secret: "mysupersecretcode",
        resave: false,
        saveUninitialized: true,
        cookie: {
            expires: Date.now() + 5 * 24 * 60 * 60 * 1000,
            maxAge: 5 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        },
    };

    app.get("/", (req, res) => {
        res.send("working root");
    });
    
    // 
    app.use(session(sessionOptions));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.use((req, res, next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user;
        next();
    });

    // app.get("/demouser", async(req, res) => {
    //     let fakeUser = new User ({
    //         email: "student@gmail.com",
    //         username: "delta-student"
    //     });

    //     let registeredUser = await User.register(fakeUser , "helloworld");
    //     res.send(registeredUser);
    // });

    app.use("/listings", listingRouter);
    app.use("/listings/:id/reviews", reviewRouter);
    app.use("/", userRouter);

    // jab wrong path pe enter kre to uska error define Page not Found set.
    app.all("*", (req, res, next) => {
        next(new ExpressError(404 , "Page Not Found!"));
    });

    // Costom error handler middleware
    app.use((err, req, res, next) => {
        let {statusCode = 500, message = "Something Went Wrong"} = err;
        res.status(statusCode).render("error.ejs", { message });
        // res.status(statusCode).send(message);
    });

    app.listen(8080 , () => {
        console.log("app is listening");
    });