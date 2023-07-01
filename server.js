// Imports
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

// Models
const User = require("./models/User");

// Environment Variables
require("dotenv");

// Constants
const PORT = 3000;

// Middleware
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "static")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "lollitato",
    resave: false,
    saveUninitialized: false,
  })
);
mongoose.connect("mongodb://127.0.0.1:27017/wordstorm");

// GET
app.get("/", (req, res) => {
  res.render("index", { loggedIn: "username" in req.session });
});

app.get("/play", (_req, res) => {
  res.render("play");
});

app.get("/stats", async (req, res) => {
  if ("username" in req.session) {
    const user = await User.findOne({ username: req.session.username });
    res.render("stats", {
      name: user.username,
      games: user.games,
    });
  } else {
    res.redirect("/");
  }
});

app.get("/shopping", (req, res) => {
  res.render("shopping", {
    username: req.session.username ?? "Guest",
    coins: req.session.coins ?? 0,
  });
});

app.get("/login", (req, res) => {
  return "username" in req.session ? res.redirect("/") : res.render("login");
});

app.get("/register", (req, res) => {
  return "username" in req.session ? res.redirect("/") : res.render("register");
});

app.get("/logout", (req, res) => {
  delete req.session.username;
  delete req.session.coins;
  res.redirect("/");
});

// POST
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = await User.findOne({
    $or: [{ username: username }, { email: username }],
  });

  if (user && (await user.validatePassword(password))) {
    req.session.username = user.username;
    req.session.coins = user.coins;
    req.session.save();
    return res.json(1);
  }

  return res.json(-1);
});

app.post("/register", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  const existingUser = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (existingUser) {
    return res.json(-1);
  }

  const user = new User({
    username: username,
    email: email,
    password: password,
    coins: 0,
    games: [],
  });

  await user.save();
  return res.json(1);
});

app.post("/purchase", async (req, res) => {
  const price = req.body.coins;

  if ("username" in req.session) {
    const user = await User.findOne({ username: req.session.username });
    user.coins -= price;
    await user.save();

    req.session.coins = user.coins;
    req.session.save();

    return res.json(1);
  }

  return res.json(-1);
});

app.post("/game", async (req, res) => {
  const score = req.body.score;
  const avgWordLen = req.body.avgWordLen;

  req.session.coins += score / 10;
  req.session.save();

  if ("username" in req.session) {
    const user = await User.findOne({ username: req.session.username });
    user.coins += score / 10;
    user.games.push({
      score: score,
      avgWordLen: avgWordLen,
    });
    await user.save();
  }

  return res.json(1);
});

app.listen(PORT, () => console.log(`Running on Port: ${PORT}`));
