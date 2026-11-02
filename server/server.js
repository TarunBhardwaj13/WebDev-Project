require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// 1. Initialize Express App & HTTP Server
const app = express();
const server = http.createServer(app);

// 2. Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

// 3. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Import Models & Routes
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Learn Unique Backend Server is running smoothly!',
  });
});

// 6. Admin Auto-Seed Function
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) return;

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: 'Super Admin',
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      });
      console.log(`✅ Default Admin Created: ${adminEmail}`);
    } else if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log(`✅ User Promoted to Admin: ${adminEmail}`);
    }
  } catch (err) {
    console.error('Admin seeding error:', err.message);
  }
};

// 7. Socket.io Real-Time Rooms (Meeting + Whiteboard)
io.on('connection', (socket) => {
  console.log(`⚡ Socket Connected: ${socket.id}`);

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });

  // Whiteboard drawing sync
  socket.on('draw-stroke', ({ roomId, strokeData }) => {
    socket.to(roomId).emit('draw-stroke', strokeData);
  });

  // Clear whiteboard canvas
  socket.on('clear-canvas', ({ roomId }) => {
    socket.to(roomId).emit('clear-canvas');
  });

  // Meeting in-room chat
  socket.on('send-room-message', ({ roomId, message }) => {
    io.to(roomId).emit('receive-room-message', message);
  });
});

// 8. MongoDB Connection & Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/learn_unique';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(' MongoDB Connected Successfully');
    seedAdmin();
    server.listen(PORT, () => {
      console.log(`🚀 Learn Unique Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' MongoDB Connection Error:', err.message);
  });