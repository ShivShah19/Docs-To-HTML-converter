document
  .getElementById("uploadForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const loadingDiv = document.getElementById("loading");
    const resultDiv = document.getElementById("result");
    const downloadLink = document.getElementById("downloadLink");

    loadingDiv.style.display = "block";
    resultDiv.style.display = "none";

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error uploading file");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = "converted.html";

      loadingDiv.style.display = "none";
      resultDiv.style.display = "block";
    } catch (error) {
      loadingDiv.style.display = "none";
      alert("An error occurred while processing the file");
    }
  });

// Drag-and-drop area logic
const dropArea = document.querySelector(".drop-area");
const fileInput = document.getElementById("fileInput");
const fileNameDisplay = document.createElement("p");
fileNameDisplay.style.marginTop = "10px";
fileNameDisplay.style.fontSize = "1em";
fileNameDisplay.style.color = "#333";

dropArea.appendChild(fileNameDisplay);

dropArea.addEventListener("click", () => {
  fileInput.click();
});

dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.style.backgroundColor = "#e6f7ff";
});

dropArea.addEventListener("dragleave", () => {
  dropArea.style.backgroundColor = "#f4f4f4";
});

// Handle file drop
dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  dropArea.style.backgroundColor = "#f4f4f4";

  if (event.dataTransfer.files.length) {
    fileInput.files = event.dataTransfer.files;
    const fileName = fileInput.files[0]?.name || "No file selected";
    fileNameDisplay.textContent = `Selected File: ${fileName}`;
    console.log("File selected:", fileInput.files[0]);
  }
});

fileInput.addEventListener("change", () => {
  document.querySelector(".choose-file").style.display = "none";
  const fileName = fileInput.files[0]?.name || "No file selected";
  fileNameDisplay.textContent = `Selected File: ${fileName}`;
});
