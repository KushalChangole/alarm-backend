require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// 👉 Replace with your MongoDB URI
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

// Schema (single alarm)
// const Alarm = mongoose.model("Alarm", {
//   hour: Number,
//   minute: Number
// });
const Alarm = mongoose.model(
  "UserData",   // model name
  new mongoose.Schema({
    hour: Number,
    minute: Number
  }),
  "UserData"    // 👈 exact collection name
);

// 👉 Save alarm
app.post("/set-alarm", async (req, res) => {
  const { hour, minute } = req.body;

  if (hour == null || minute == null) {
    return res.status(400).json({ error: "Invalid input" });
  }

  await Alarm.deleteMany(); // keep only latest
  await Alarm.create({ hour, minute });

  res.json({ message: "Alarm saved" });
});

// 👉 Get alarm (Pico will call this)
app.get("/get-alarm", async (req, res) => {
  const alarm = await Alarm.findOne();

  if (!alarm) {
    return res.json({ hour: 12, minute: 0 }); // default
  }

  res.json(alarm);
});

app.listen(3000, () => console.log("Server running on port 3000"));