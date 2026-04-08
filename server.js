require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// -------- ROOT ROUTE (for testing) --------
app.get("/", (req, res) => {
  res.send("Server is running");
});

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
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------- GET ALARMS AS ARRAY --------
app.get("/get-alarm", async (req, res) => {
  try {
    const alarm = await Alarm.findOne();

    if (!alarm) {
      return res.json([
        { hour: 8, minute: 0, schedule: "morning" },
        { hour: 13, minute: 0, schedule: "afternoon" },
        { hour: 20, minute: 0, schedule: "evening" }
      ]);
    }

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
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------- START SERVER FIRST --------
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// -------- CONNECT DB AFTER SERVER START --------
mongoose.connect(process.env.MONGO_URL, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Error:", err));