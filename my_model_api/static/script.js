const imageInput = document.getElementById('imageInput');
const predictBtn = document.getElementById('predictBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultsDiv = document.querySelector('#results');

let currentImage = null;

// Load image into canvas
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      currentImage = img;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  // Reset result area
  resultsDiv.className = "results-box waiting";
  resultsDiv.innerHTML = `<p><div class="spinner"></div>Analyzing image...</p>`;
});

// Send prediction request
predictBtn.addEventListener('click', async () => {
  if (!currentImage) {
    alert("Please upload an image first.");
    return;
  }

  resultsDiv.className = "results-box waiting";
  resultsDiv.innerHTML = `<p><div class="spinner"></div> Predicting...</p>`;

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: currentImage.src })  // send full base64 string
    });

    const result = await response.json();

    if (result.error) {
      resultsDiv.className = "results-box error";
      resultsDiv.innerHTML = `<strong>Error:</strong> ${result.error}`;
      return;
    }

    // Redraw image and draw bounding boxes
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0);

    // Display predictions
    if (result.predictions.length > 0) {
      const confidentPredictions = result.predictions.filter(p => p.score >= 0.6);

      resultsDiv.className = "results-box success";
      resultsDiv.innerHTML = `
        <strong>Total Detections:</strong> ${confidentPredictions.length}
        <ul>
          ${confidentPredictions.map(pred => `
            <li>🏷️ <strong>${pred.label}</strong> - Confidence: ${(pred.score * 100).toFixed(1)}%</li>
          `).join('')}
        </ul>`;
    } else {
      resultsDiv.className = "results-box success";
      resultsDiv.innerHTML = "✅ No detections found.";
    }

    // Draw boxes on canvas
    result.predictions.forEach(pred => {
      const [x1, y1, x2, y2] = pred.box;

      // Only draw if score is above threshold
      if (pred.score >= 0.6) {
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        ctx.fillStyle = "#FF0000";
        ctx.font = "16px Arial";
        ctx.fillText(`${pred.label} (${(pred.score * 100).toFixed(1)}%)`, x1, y1 - 10);
      }
    });

  } catch (err) {
    console.error(err);
    resultsDiv.className = "results-box error";
    resultsDiv.innerHTML = "<strong>Prediction failed.</strong>";
  }
});