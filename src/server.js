import express from "express";
import { callAPI } from "./apiCaller.js";

const app = express();
const port = 5001;

app.get("/api", async (req, res) => {
  const { licensePlate, vehicleType = "car" } = req.query;

  if (!licensePlate) {
    return res.status(400).json({ error: "License plate is required" });
  }

  // Validate vehicle type
  if (vehicleType !== "car" && vehicleType !== "motorcycle") {
    return res.status(400).json({ 
      error: "Invalid vehicle type. Must be 'car' or 'motorcycle'" 
    });
  }

  try {
    const violations = await callAPI(licensePlate, vehicleType);
    if (violations) {
      res.json({ 
        licensePlate, 
        vehicleType,
        violations 
      });
    } else {
      res.status(404).json({ error: "No violations found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
