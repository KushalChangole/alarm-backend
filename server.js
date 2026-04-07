require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// -------- DB CONNECTION --------
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// -------- SCHEMA (3 alarms) --------
const Alarm = mongoose.model(
  "UserData",
  new mongoose.Schema({
    morning: {
      hour: Number,
      minute: Number
    },
    afternoon: {
      hour: Number,
      minute: Number
    },
    evening: {
      hour: Number,
      minute: Number
    }
  }),
  "UserData"
);

// -------- SAVE ALL 3 ALARMS --------
app.post("/set-alarm", async (req, res) => {
  const { morning, afternoon, evening } = req.body;

  // Validation
  if (!morning || !afternoon || !evening) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    await Alarm.deleteMany(); // keep only latest set

    await Alarm.create({
      morning,
      afternoon,
      evening
    });

    res.json({ message: "All alarms saved" });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// -------- GET ALL ALARMS --------
app.get("/get-alarm", async (req, res) => {
  try {
    const alarm = await Alarm.findOne();

    if (!alarm) {
      return res.json({
        morning: { hour: 8, minute: 0 },
        afternoon: { hour: 13, minute: 0 },
        evening: { hour: 20, minute: 0 }
      });
    }

    res.json(alarm);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// -------- START SERVER --------
app.listen(3000, () => console.log("Server running on port 3000"));