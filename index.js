const express = require("express");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

//  databses

mongoose
  .connect(
    "mongodb+srv://hky3122003:Hari1234@digitalnotes.egdsxgb.mongodb.net/",
    { dbName: "digitlNotes" }
  )
  .then(() => {
    console.log("server is working ");
  })
  .catch((error) => console.log(error));

const userSchema = new mongoose.Schema({
  userName: String,
  Email: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

const notesSchema = new mongoose.Schema({
  title: String,
  content: String,
});
const Notes = mongoose.model("Notes", notesSchema);

// get api

app.get("/", (req, res) => {
  res.sendFile("./home.html", { root: __dirname });
});

app.get("/register", (req, res) => {
  res.sendFile("./register.html", { root: __dirname });
});

app.get("/login", (req, res) => {
  res.sendFile("./login.html", { root: __dirname });
});

app.get("/notes", (req, res) => {
  res.sendFile("./notes.html", { root: __dirname });
});
app.get("/getData", async (req, res) => {
  try {
    const data = await Notes.find();
    res.json(data);
  } catch (error) {
    console.log("error");
  }
});

app.get("/getUser", async (req, res) => {
  try {
    const data = await User.find();
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

// post api

app.post("/register", (req, res) => {
  const { name, email, password, cpassword } = req.body;
  User.findOne({ Email: email })
    .then((docs) => {
      User.create({
        userName: name,
        Email: email,
        password: password,
      });
      res.sendFile("./notes.html", { root: __dirname });
      console.log("done new");
    })
    .catch((e) => {
      console.log(e);
    });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ Email: email })
    .then((doc) => {
      if (!doc) {
        res.sendFile("/register.html", { root: __dirname });
      }
      const token = jwt.sign({ Email: email }, "digtalnotes");
      res.sendFile("./notes.html", { root: __dirname });
    })
    .catch((e) => console.log(e));
});

app.post("/notes", (req, res) => {
  const { title, content } = req.body;
  Notes.create({
    title: title,
    content: content,
  });
  res.sendFile("./notes.html", { root: __dirname });
  console.log("added successfully");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
