const express = require("express");
const tokenController = require("../controllers/token");
const { adminMiddleware } = require("../middleware");

const router = express.Router();

router.post("/", adminMiddleware, tokenController.createToken);
router.get("/", tokenController.getAllTokens);
router.get("/:pairAddress", tokenController.getTokenById);
router.put("/:pairAddress", adminMiddleware, tokenController.updateToken);
router.delete("/:pairAddress", tokenController.deleteToken);

module.exports = router;
