const mongoose = require("mongoose");
const Token = require("../models/Token");
const Transaction = require("../models/Transaction");
const { getIo } = require("../socket");

async function createTransaction(req, res) {
  try {
    const { type, volume, priceUSD, priceSOL, pnl, unrealized } = req.body;
    let tokenId = req.body.tokenId;
    const makerId = req.user._id;

    // Log incoming request body for debugging
    console.log("Received Data:", req.body);

    // Ensure pnl and unrealized are provided and valid numbers
    if (pnl === undefined || unrealized === undefined) {
      return res.status(400).json({ error: "pnl and unrealized are required fields." });
    }

    const token = await Token.findOne({ pairAddress: tokenId }).populate("maker");
    if (!token) {
      return res.status(404).json({ error: "Token not found" });
    }

    const transaction = new Transaction({
      tokenId: token._id,
      type,
      volume,
      priceUSD,
      priceSOL,
      maker: makerId,
      pnl: Number(pnl), // Ensure it's a number
      unrealized: Number(unrealized),
    });

    await transaction.save();
    await token.save();

    const io = getIo();
    console.log("Emitting transaction event with data:", transaction);
    io.emit("transaction", {
      ...transaction.toObject(),
      pairAddress: token.pairAddress,
      maker: token.maker,
    });
    io.emit("token", token);

    return res.status(201).json(transaction);
  } catch (error) {
    console.error("Transaction Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function getAllTransactions(req, res) {
  try {
    const transactions = await Transaction.find()
      .populate("tokenId")
      .populate("maker")
      .sort({ createdAt: -1 });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function getTransactionById(req, res) {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("tokenId")
      .populate("maker");

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function updateTransaction(req, res) {
  try {
    const makerId = req.user._id;
    const { pnl, unrealized } = req.body;

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    if (transaction.maker.toString() !== makerId.toString()) {
      return res.status(403).json({
        error: "Unauthorized: You can only update your own transactions",
      });
    }

    // Ensure pnl and unrealized are provided and valid numbers
    if (pnl === undefined || unrealized === undefined) {
      return res.status(400).json({ error: "pnl and unrealized are required fields." });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { ...req.body, pnl: Number(pnl), unrealized: Number(unrealized) },
      { new: true }
    );

    const io = getIo();
    io.emit("transaction", updatedTransaction);

    return res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function deleteTransaction(req, res) {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const io = getIo();
    io.emit("delete-transaction", transaction);
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
