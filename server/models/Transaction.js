const mongoose = require("mongoose");
const { getIo } = require("../socket");

const transactionSchema = new mongoose.Schema(
  {
    tokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
      required: true,
    },
    type: { type: String, enum: ["buy", "sell"], required: true },
    volume: { type: Number, required: true },
    priceUSD: { type: Number, required: true },
    priceSOL: { type: Number, required: true },
    maker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pnl: { type: Number,required: true },
    unrealized: { type: Number,required: true },
  },
  { timestamps: true }
);

transactionSchema.post("save", async function (doc) {
  const io = getIo();
  io.emit("transaction", doc);
});
transactionSchema.post("findOneAndUpdate", async function (doc) {
  const io = getIo();
  io.emit("transaction", doc);
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
