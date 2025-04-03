const mongoose = require("mongoose");
const { getIo } = require("../socket");

const tokenSchema = new mongoose.Schema(
  {
    priceUSD: { type: Number, required: true },
    priceSOL: { type: Number, required: true },
    liquidity: { type: Number, required: true },
    fdv: { type: Number, required: true },
    mktCap: { type: Number, required: true },
    volume: { type: Number, required: true },
    txns: { type: Number },
    maker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buys: { type: Number, required: true },
    sells: { type: Number, required: true },
    buyVol: { type: Number, required: true },
    sellVol: { type: Number, required: true },
    buyers: { type: Number, required: true },
    sellers: { type: Number, required: true },
    pairAddress: { type: String, required: true },
    logo: { type: String, required: true },
    mintA: {
      address: { type: String, required: true },
      name: { type: String, required: true },
      symbol: { type: String },
      price: { type: Number, required: true },
      pool: { type: Number, required: true },
    },
    bought: {
      priceUSD: { type: Number },
      volume: { type: Number },
      txns: { type: Number },
    },
    sold: {
      priceUSD: { type: Number },
      volume: { type: Number },
      txns: { type: Number },
    },
    mintB: {
      name: { type: String, default: "Solana" },
      symbol: {
        type: String,
        default:
          "https://images.seeklogo.com/logo-png/39/1/solana-sol-logo-png_seeklogo-398274.png",
      },
      address: {
        type: String,
        default: "So11111111111111111111111111111111111111112",
      },
      price: { type: Number, default: 0 },
      pool: { type: Number, default: 0 },
    },

    cumulativePNL: { type: Number, default: 0 },
    cumulativeUnrealized: { type: Number, default: 0 },
  },
  { timestamps: true }
);

tokenSchema.pre("save", function (next) {
  if (!this.mintA.symbol) {
    this.mintA.symbol = this.logo;
  }
  next();
});

tokenSchema.post("save", async function (doc) {
  const io = getIo();
  io.emit("token", doc);
});

tokenSchema.post("findOneAndUpdate", async function (doc) {
  const io = getIo();
  io.emit("token", doc);
});

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;
