import express from "express";
import { callAPI } from "./apiCaller.js";

const app = express();
const port = 5002;

// test route
app.get("/test", (req, res) => {
  return res.status(200).json({ message: "API is working" });
});

// main API
app.get("/api", async (req, res) => {
  const { licensePlate, vehicleType = "car" } = req.query;

  if (!licensePlate) {
    return res.status(400).json({ error: "License plate is required" });
  }

  if (vehicleType !== "car" && vehicleType !== "motorcycle") {
    return res.status(400).json({
      error: "Invalid vehicle type. Must be 'car' or 'motorcycle'",
    });
  }

  try {
    const violations = await callAPI(licensePlate, vehicleType);
    if (violations) {
      res.json({
        licensePlate,
        vehicleType,
        violations,
      });
    } else {
      res.status(404).json({ error: "No violations found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✨ Quan trọng: dùng 0.0.0.0 thay cho localhost
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is running on:`);
  console.log(` - Local:   http://localhost:${port}`);
  console.log(` - Network: http://192.168.1.3:${port}`); // thay 192.168.1.3 bằng IP LAN của bạn
});
