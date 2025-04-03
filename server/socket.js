let io;

function setIo(socketIo) {
  io = socketIo;
}

function getIo() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

module.exports = {
  setIo,
  getIo,
};