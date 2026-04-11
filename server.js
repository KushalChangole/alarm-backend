require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());


// =========================
// 🔹 ROOT
// =========================
app.get("/", (req, res) => {
  res.send("Server is running");
});


// =========================
// 🔹 ALARM SCHEMA
// =========================
const Alarm = mongoose.model(
  "UserData",
  new mongoose.Schema({
    morning: { hour: Number, minute: Number },
    afternoon: { hour: Number, minute: Number },
    evening: { hour: Number, minute: Number }
  }),
  "UserData"
);


// =========================
// 🔹 MEDICINE LOG SCHEMA
// =========================
const MedicineLog = mongoose.model(
  "MedicineLog",
  new mongoose.Schema({
    date: String,
    schedule: String,
    taken: Boolean
  }),
  "MedicineLog"
);


// =========================
// 🔹 SET ALARMS
// =========================
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

    console.log("Alarms updated");

    res.json({ message: "All alarms saved" });

  } catch (err) {
    console.error("SET ALARM ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// 
// 🔹 GET ALARMS (Pico calls this)
// 
app.get("/get-alarm", async (req, res) => {
  try {
    console.log("GET /get-alarm request received");

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
    console.error("GET ALARM ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// =========================
// 🔹 SAVE MEDICINE STATUS (BUTTON EVENT)
// =========================
app.post("/medicine-status", async (req, res) => {

  const { date, schedule, taken } = req.body;

  if (!date || !schedule || taken === undefined) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    // Remove duplicate entry
    await MedicineLog.deleteMany({ date, schedule });

    await MedicineLog.create({
      date,
      schedule,
      taken
    });

    console.log("BUTTON EVENT:", { date, schedule, taken });

    res.json({ message: "Status saved" });

  } catch (err) {
    console.error("SAVE STATUS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// =========================
// 🔹 GET MEDICINE HISTORY (Dashboard)
// =========================
app.get("/get-history", async (req, res) => {
  try {
    console.log("GET /get-history request (Dashboard)");

    const data = await MedicineLog.find().sort({ _id: -1 });

    res.json(data);

  } catch (err) {
    console.error("GET HISTORY ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// 
// 🔹 START SERVER
// 
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});


// 
// 🔹 CONNECT MONGODB
// 
mongoose.connect(process.env.MONGO_URL, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Error:", err));