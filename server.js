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

// -------- SCHEMA --------
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

  if (!morning || !afternoon || !evening) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    await Alarm.deleteMany();

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

// -------- GET ALARMS AS ARRAY --------
app.get("/get-alarm", async (req, res) => {
  try {
    const alarm = await Alarm.findOne();

    // 👉 Default if no data
    if (!alarm) {
      return res.json([
        { hour: 8, minute: 0, schedule: "morning" },
        { hour: 13, minute: 0, schedule: "afternoon" },
        { hour: 20, minute: 0, schedule: "evening" }
      ]);
    }

    // 👉 Convert object → array
    const response = [
      {
        hour: alarm.morning.hour,
        minute: alarm.morning.minute,
        schedule: "morning"
      },
      {
        hour: alarm.afternoon.hour,
        minute: alarm.afternoon.minute,
        schedule: "afternoon"
      },
      {
        hour: alarm.evening.hour,
        minute: alarm.evening.minute,
        schedule: "evening"
      }
    ];

    res.json(response);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// -------- START SERVER --------
app.listen(3000, () => console.log("Server running on port 3000"));