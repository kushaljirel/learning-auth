//jshint esversion:6
import dotenv from "dotenv";
dotenv.config({
  path: "./.env.local",
});

import express from "express";
import bodyParser from "body-parser";

import connectDB from "./connectDB.js";
import { User } from "./model/models.js";
import { Secret } from "./model/models.js";

const app = express();

// Database connection
await connectDB();

const PORT = process.env.PORT || 3000;

// console.log(typeof process.env.MONGO_URI)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("home");
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
      const foundUser = await User.findOne({ username: username });
      if (!foundUser) {
        res.send("User not found!");
      } else {
        if (foundUser.password === password) {
          console.log("User Logged Successfully");
          res.redirect("/secrets");
        } else {
          res.send("password was wrong");
        }
      }
    } catch (error) {
      console.log("User failed to login!");
      console.log(error);
      res.send("Failed to Find user from database");
    }
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // console.log(username, password)
    try {
      const user = new User({
        username: req.body.username,
        password: req.body.password,
      });
      await user.save();
      console.log("User registered Successfully");
      res.send("register success");
    } catch (error) {
      console.log("User failed to register!");
      console.log(error);
      res.redirect("register");
    }
  });

app.route("/secrets").get((req, res) => {
  res.render("secrets");
});

app
  .route("/submit")
  .get((req, res) => {
    res.render("submit");
  })
  .post(async (req, res) => {
    try {
      const userSecret = await Secret({
        secret: req.body.secret,
      });
      userSecret.save();
      console.log("secret message saved");
      res.redirect("submit");
    } catch (error) {
      console.log("couldnt save secret message");
      console.log(error);
      res.redirect("submit");
    }
  });

app.listen(PORT, () => {
  console.log(`APP is running in port ${PORT}`);
});
