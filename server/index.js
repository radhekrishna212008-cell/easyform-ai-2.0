const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/verify", upload.array("files", 100), async (req, res) => {

  const results = req.files.map((file) => {

    const sizeKB = Math.round(file.size / 1024);

    let status = "Ready";

    if (sizeKB < 40) {
      status = "Missing";
    } else if (sizeKB < 120) {
      status = "Review";
    }

    return {
      file: file.originalname,
      sizeKB,
      status,
    };
  });

  res.json({
    success: true,
    total: results.length,
    results,
  });

});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});