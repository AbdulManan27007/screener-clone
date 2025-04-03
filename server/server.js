const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const transactionsRoutes = require("./routes/transaction");
const tokenRoutes = require("./routes/token");
const userRoutes = require("./routes/user");
const traderRoutes = require("./routes/trader");
const uploadRoutes = require("./routes/upload");
const { setIo } = require("./socket");
require("./config/db");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors("*"));
app.use(morgan("dev"));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

setIo(io);
app.use(cors());
app.use(express.json());
app.use("/api/transactions", transactionsRoutes);
app.use("/api/topTraders", traderRoutes);
app.use("/api", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/", (req, res) => {
  res.send("Backend Is Running");
});
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("token", (data) => {
    console.log("Received token event:", data);
    socket.emit("token-update-response", {
      message: "Token updated successfully",
      data: data,
    });
    console.log("Emitted token-update-response with data:", data);
  });
  socket.on("transaction", (data) => {
    console.log("Received transaction event:", data);
    socket.emit("transaction-update-response", {
      message: "Transaction updated successfully",
      data: data,
    });
    console.log("Emitted transaction-update-response with data:", data);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

