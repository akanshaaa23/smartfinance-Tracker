// server.js

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import txRoutes from "./routes/routes.js"; // <--- Corrected: Using 'routes.js' as per your file structure
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();

// Middleware for CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ Mongo error:", err));

// Use API routes
app.use("/api/tx", txRoutes);

// --- START: STATIC FILE SERVING FOR FRONTEND ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Fallback: For any GET requests not handled by API or static files,
// serve the main index.html. This is crucial for single-page applications.
app.get('*', (req, res) => { // Using '*' here, as it's more standard for SPA fallbacks
  res.sendFile(path.join(__dirname, 'public', 'finance.html'));
});
// --- END: STATIC FILE SERVING FOR FRONTEND ---


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));