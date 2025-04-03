const cloudinary = require("../config/cloudinary");

const uploadFile = async (req, res) => {  
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
  
    try {
      const uploadResult = await cloudinary.uploader.upload_stream(
        {
          folder: req.body.type || "uploads",
          public_id: req.file.originalname.replace(/\s+/g, "_"),
        },
        (error, result) => {
          if (error) {
            return res.status(500).json({ message: "File upload failed", error: error.message });
          }
  
          res.status(200).json({
            message: "File uploaded successfully",
            files: [{ url: result.secure_url, public_id: result.public_id }],
          });
        }
      );
  
      uploadResult.end(req.file.buffer);
    } catch (error) {
      console.error("Error during file upload:", error);
      res.status(500).json({ message: "File upload failed", error: error.message });
    }
  };

module.exports = { uploadFile };
