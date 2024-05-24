import dotenv from "dotenv";
dotenv.config({
  path: "./.env.local",
});

import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import connectDB from "./connectDB.js";
import { User } from "./model/models.js";
import { Secret } from "./model/models.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
await connectDB();

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

// setup session middleware
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 600000,
    },
  })
);

// initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// configure local strategy for passport
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const foundUser = await User.findOne({ username });
      if (!foundUser) {
        return done(null, false, { message: "Incorrect username" });
      }
      const isMatch = await bcrypt.compare(password, foundUser.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, foundUser);
    } catch (err) {
      return done(err)
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// home route
app.get("/", (req, res) => {
  res.render("home");
});

// register route
app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post(async (req, res) => {
    const { username, password } = req.body;

    // for bcrypt password encryption
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).send("User already exists");
      }

      const newUser = new User({
        username: username,
        password: hash,
      });
      await newUser.save();

      console.log("User registered Successfully");
      res.status(200).redirect("/login");
    } catch (error) {
      console.log("User failed to register!");
      console.log(error);
      res.status(500).redirect("/register");
    }
  });

// login route
app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(
    passport.authenticate("local", {
      successRedirect: "/secrets",
      failureRedirect: "/login",
      failureFlash: false,
    })
  );

// secret route
app.route("/secrets").get(async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).redirect("/login");
  }
  const foundSecrets = await Secret.find({})
  res.render("secrets", {foundSecrets});
});

// submit secrets route
app
  .route("/submit")
  .get(async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).redirect("/login");
    }
    res.render("submit");
  })
  .post(async (req, res) => {
    try {
      const userSecret = await Secret({
        secret: req.body.secret,
      });
      userSecret.save();
      console.log("secret message saved");
      res.redirect("/secrets");
    } catch (error) {
      console.log("couldn/'t save secret message");
      console.log(error);
      res.redirect("/submit");
    }
  });

// logout route
app.route("/logout").get((req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Error logging out");
    else return res.status(200).redirect("/");
  });
});

// listening to port
app.listen(PORT, () => {
  console.log(`APP is running in port ${PORT}`);
});
