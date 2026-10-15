console.log("--- Server starting ---");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// =====================================
// 1. CORS CONFIGURATION
// =====================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked this origin: ${origin}`)
      );
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =====================================
// 2. BODY PARSING
// =====================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// 3. HEALTH CHECK
// =====================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Learn Unique API is running!",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});

// =====================================
// 4. LOAD ROUTES
// =====================================

function loadRoute(path, mountPath, routeName) {
  try {
    const routes = require(path);

    app.use(mountPath, routes);

    console.log(`✅ ${routeName} routes loaded`);
  } catch (error) {
    console.error(`❌ ${routeName} routes failed to load:`);
    console.error(error.message);

    // Stop startup if a required route cannot load.
    throw error;
  }
}

// Resources
loadRoute(
  "./resources/resourceRoutes",
  "/api/resources",
  "Resources"
);

// Authentication
loadRoute(
  "./routes/authRoutes",
  "/api/auth",
  "Auth"
);

// Users
loadRoute(
  "./routes/userRoutes",
  "/api/users",
  "User"
);

// Requests
loadRoute(
  "./routes/requestRoutes",
  "/api/requests",
  "Request"
);

// Sessions
loadRoute(
  "./routes/sessionRoutes",
  "/api/sessions",
  "Session"
);

// Matches
// This requires server/routes/matchRoutes.js to exist.
// The file must export an Express router.
loadRoute(
  "./routes/matchRoutes",
  "/api/matches",
  "Matches"
);

// =====================================
// 5. UNKNOWN ROUTE HANDLER
// =====================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================
// 6. GLOBAL ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  if (err.message.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Something went wrong",
  });
});

// =====================================
// 7. DATABASE + SERVER STARTUP
// =====================================

const PORT = process.env.PORT || 5000;

async function startServer() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error(
      "❌ MONGO_URI is missing from the .env file."
    );

    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB Connected Successfully!");

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running at http://localhost:${PORT}`
      );

      console.log(
        "🌐 Frontend origin: http://localhost:5173"
      );
    });
  } catch (error) {
    console.error("❌ Startup failed:", error.message);

    process.exit(1);
  }
}

startServer();