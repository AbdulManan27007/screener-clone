const express = require("express");
const uploadController = require("../controllers/upload");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("image");
const router = express.Router();

router.post("/",upload, uploadController.uploadFile);

module.exports = router;
