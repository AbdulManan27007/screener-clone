const express = require("express");
const { authMiddleware } = require("../middleware");
const user = require("../controllers/user");

const router = express.Router();

router.post("/register", user.register);

router.post("/login", user.login);

router.put("/update", authMiddleware, user.update);

router.get("/me", authMiddleware, user.me);

router.get("/users", authMiddleware, user.users);

router.delete("/users/:id", authMiddleware, user.delete);

module.exports = router;
