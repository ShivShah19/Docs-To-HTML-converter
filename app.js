const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
require("dotenv").config();

const app = express();

// Use memory storage instead of writing files permanently
const upload = multer({ dest: "uploads/" });

// static files (CSS, JS)
app.use(express.static("public"));

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Function to convert DOCX to HTML
async function docxToHtml(filePath) {
  const result = await mammoth.convertToHtml({ path: filePath });
  const htmlContent = result.value;

  const cssStyles = `
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background-color: #f4f4f9;
      color: #333;
    }
    h1 { font-size: 2.5em; color: #2c3e50; margin-bottom: 20px; }
    h2 { font-size: 2em; color: #34495e; margin-top: 20px; margin-bottom: 15px; }
    h3 { font-size: 1.75em; color: #34495e; margin-top: 15px; margin-bottom: 10px; }
    p { font-size: 1em; line-height: 1.6; margin-bottom: 15px; }
    ul, ol { margin-left: 20px; margin-bottom: 20px; }
    ul li, ol li { font-size: 1em; line-height: 1.5; margin-bottom: 10px; }
  `;

  return `
    <html>
      <head><style>${cssStyles}</style></head>
      <body>${htmlContent}</body>
    </html>
  `;
}

// Upload + convert + discard
app.post("/upload", upload.single("docxFile"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  const filePath = path.join(__dirname, req.file.path);

  try {
    const htmlContent = await docxToHtml(filePath);

    // Delete uploaded file immediately after conversion
    fs.unlinkSync(filePath);

    // Instead of saving .html file, just send response
    res.send(htmlContent);
  } catch (error) {
    res.status(500).send("Error converting DOCX to HTML");
    console.error(error);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
