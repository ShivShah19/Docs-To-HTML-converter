const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
require("dotenv").config();

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// static files (CSS, JS)
app.use(express.static("public"));

// Route homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Function to convert DOCX to HTML using mammoth
function docxToHtml(filePath) {
  return new Promise((resolve, reject) => {
    mammoth
      .convertToHtml({ path: filePath })
      .then((result) => {
        const htmlContent = result.value;

        // Adding custom CSS styles to the HTML content
        const cssStyles = `
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f4f4f9;
            color: #333;
          }
          h1 {
            font-size: 2.5em;
            color: #2c3e50;
            margin-bottom: 20px;
          }
          h2 {
            font-size: 2em;
            color: #34495e;
            margin-top: 20px;
            margin-bottom: 15px;
          }
          h3 {
            font-size: 1.75em;
            color: #34495e;
            margin-top: 15px;
            margin-bottom: 10px;
          }
          p {
            font-size: 1em;
            line-height: 1.6;
            margin-bottom: 15px;
          }
          ul, ol {
            margin-left: 20px;
            margin-bottom: 20px;
          }
          ul li, ol li {
            font-size: 1em;
            line-height: 1.5;
            margin-bottom: 10px;
          }
        `;

        const html = `
          <html>
            <head>
              <style>${cssStyles}</style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `;

        resolve(html);
      })
      .catch((err) => reject(err));
  });
}

// Route to handle file upload and conversion
app.post("/upload", upload.single("docxFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const filePath = path.join(__dirname, "uploads", req.file.filename);

  docxToHtml(filePath)
    .then((htmlContent) => {
      const htmlFilePath = path.join(
        __dirname,
        "uploads",
        `${req.file.filename}.html`
      );
      fs.writeFileSync(htmlFilePath, htmlContent);

      res.download(htmlFilePath, (err) => {
        if (err) {
          console.log(err);
        }
        fs.unlinkSync(filePath);
        fs.unlinkSync(htmlFilePath);
      });
    })
    .catch((error) => {
      res.status(500).send("Error converting DOCX to HTML");
      console.error(error);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
