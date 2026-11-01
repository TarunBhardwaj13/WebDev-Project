console.log("--- Server starting ---");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
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
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked this origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
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
    console.error(error.stack || error.message);
    throw error;
  }
}

// Routes
loadRoute("./resources/resourceRoutes", "/api/resources", "Resources");
loadRoute("./routes/authRoutes", "/api/auth", "Auth");
loadRoute("./routes/userRoutes", "/api/users", "User");
loadRoute("./routes/requestRoutes", "/api/requests", "Request");
loadRoute("./routes/sessionRoutes", "/api/sessions", "Session");
loadRoute("./routes/matchRoutes", "/api/matches", "Matches");
loadRoute("./routes/adminRoutes", "/api/admin", "Admin");

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

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  if (err.message && err.message.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed",
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Something went wrong",
  });
});

// =====================================
// 7. HTTP SERVER & SOCKET.IO SETUP
// =====================================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ User connected to socket:", socket.id);

  // Room Join
  socket.on("join-room", ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId || socket.id} joined meeting room: ${roomId}`);
    socket.to(roomId).emit("user-connected", userId || socket.id);

    // In-Meeting Real-time Chat
    socket.on("send-message", (data) => {
      io.to(roomId).emit("receive-message", data);
    });

    // Collaborative Whiteboard Drawing
    socket.on("draw-data", (drawData) => {
      socket.to(roomId).emit("draw-data", drawData);
    });

    // Clear Whiteboard
    socket.on("clear-board", () => {
      socket.to(roomId).emit("clear-board");
    });

    // Disconnect Handler
    socket.on("disconnect", () => {
      console.log(`User disconnected from room: ${roomId}`);
      socket.to(roomId).emit("user-disconnected", userId || socket.id);
    });
  });
});

// =====================================
// 8. DATABASE + SERVER STARTUP
// =====================================
const PORT = process.env.PORT || 5000;

async function startServer() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing from the .env file.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected Successfully!");

    server.listen(PORT, () => {
      console.log("-----------------------------------");
      console.log("🚀 Learn Unique Server Started");
      console.log(`🚀 API & Socket Server: http://localhost:${PORT}`);
      console.log("🌐 Frontend Origins Allowed:", allowedOrigins.join(", "));
      console.log("✅ Admin API: /api/admin");
      console.log("-----------------------------------");
    });
  } catch (error) {
    console.error("❌ Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();

