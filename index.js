const express = require("express");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

app.use(express.static(__dirname))
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
  User: String,
  Notes: [{ Title: String, Content: String }]
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
app.get("/getUser", async (req, res) => {
  try {
    const data = await User.find();
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});



app.post("/matchPassword", async (req, res) => {
  try {
    const { hashed, original } = req.body;
    const bool = await bcrypt.compare(original, hashed);
    res.json(bool)
  } catch (e) {
    res.json(false)
    console.log(e)
  }
})

app.post("/deleteNotes", async (req, res) => {
  try {
    const { Id, email } = req.body
    await Notes.updateOne({ User: email }, { $pull: { Notes: { _id: Id } } })
    res.json({ done: true })
  } catch (error) {
    res.json({ done: false })
    console.log(error)
  }
})

app.post("/editNotes", async (req, res) => {
  try {
    const { Id, email, Content } = req.body
    await Notes.updateOne({ "Notes._id": Id }, { $set: { "Notes.$.Content": Content } })
    res.json({ done: true })
  } catch (error) {
    res.json({ done: false })
    console.log(error)
  }
})

app.post("/getData", async (req, res) => {
  try {
    const user = req.body.Email
    const data = await Notes.findOne({ User: user });
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});



app.post("/userAuth", (req, res) => {
  try {
    let token = req.body.token;
    const decode = jwt.verify(token, "digitalnotes")
    res.json({ Login: true, data: decode })
  } catch {
    res.json({ Login: false, data: null })
  }
})

// post api

app.post("/login", async (req, res) => {

  try {
    const { name, email, password, cpassword } = req.body;
    const hashed = await bcrypt.hash(password, 10)
    const bool = await bcrypt.compare("12", hashed)
    await User.create({
      userName: name,
      Email: email,
      password: hashed,
    });
    res.sendFile("./login.html", { root: __dirname });
  } catch (e) {
    console.log(e)
  }

});
let token;
app.post("/getToken", async (req, res) => {
  token = jwt.sign(req.body, "digitalnotes", { expiresIn: 86400 })
  res.json(token)
})

app.post("/notes/v1", async (req, res) => {
  const { title, content, email } = req.body;

  let userPresent = await Notes.find({ User: email })

  if (userPresent.length == 0) {
    await Notes.create({
      User: email,
      Notes: [{
        Title: title,
        Content: content
      }]
    })
  } else {
    await Notes.updateOne({ User: email }, { $push: { Notes: [{ Title: title, Content: content }] } })
  }

  res.json({ done: true });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
