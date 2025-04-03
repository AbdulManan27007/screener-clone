const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction");
const { authMiddleware } = require("../middleware");

router.post("/", authMiddleware, transactionController.createTransaction);
router.get("/", transactionController.getAllTransactions);
router.get("/:id", transactionController.getTransactionById);
router.put("/:id", authMiddleware, transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
