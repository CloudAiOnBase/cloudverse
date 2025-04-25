const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // open CORS for now
  }
});

const players = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("new-player", (playerData) => {
    players[socket.id] = playerData;
    socket.broadcast.emit("player-joined", { id: socket.id, ...playerData });
  });

  socket.on("move", (data) => {
    if (players[socket.id]) {
      players[socket.id].position = data.position;
      players[socket.id].rotation = data.rotation;
      socket.broadcast.emit("player-moved", { id: socket.id, ...data });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete players[socket.id];
    socket.broadcast.emit("player-left", { id: socket.id });
  });
});

server.listen(3001, () => {
  console.log("Socket.IO server running on port 3001");
});
