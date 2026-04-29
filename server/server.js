const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Trigger Supabase connection test on startup
require("./config/database");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - IMPORTANT: This fixes the CORS error
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/motards", require("./routes/motards"));
app.use("/api/motos", require("./routes/motos"));
app.use("/api/clients", require("./routes/clients"));
app.use("/api/admins", require("./routes/admins"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/avis", require("./routes/avis"));


// Test route
app.get("/", (req, res) => {
  res.json({ message: "VTC Moto API is running!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
