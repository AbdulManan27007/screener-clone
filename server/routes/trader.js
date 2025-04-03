const express = require("express");
const router = express.Router();
const { getTopTraders } = require("../controllers/trader");

router.get("/", getTopTraders);

module.exports = router;
