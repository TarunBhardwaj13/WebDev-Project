# Learn Unique - Peer-to-Peer Skill Exchange (MERN)

## Setup
1. Server:
   cd server && cp .env.example .env   (MONGO_URI aur JWT_SECRET bharo)
   npm install && npm run dev          (http://localhost:5000)
2. Client:
   cd client && npm install && npm run dev   (http://localhost:5173)
3. Optional admin: .env mein ADMIN_EMAIL/ADMIN_PASSWORD likho, phir `npm run seed:admin` (server folder)

## Flow
Search peer -> send request -> peer accepts -> either user schedules a meeting
-> Meeting room: live whiteboard + chat (Socket.IO) + Jitsi video call link.

## API
- Auth: POST /api/auth/register, /login, GET /api/auth/me
- Users: GET /api/users/search?skill=&city=, PUT /api/users/me, GET /api/users/:id
- Requests: POST /api/requests, GET /api/requests, PATCH /api/requests/:id
- Meetings: POST /api/meetings, GET /api/meetings, GET /api/meetings/:id, PATCH /api/meetings/:id/end
- Socket events: join, chat:send/chat:new, board:stroke, board:clear
