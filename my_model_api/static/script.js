const imageInput = document.getElementById('imageInput');
const predictBtn = document.getElementById('predictBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultsDiv = document.querySelector('#results');

let currentImage = null;

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

  resultsDiv.className = 'results-box waiting';
  resultsDiv.innerHTML = `<p>🧠 Waiting for prediction...</p>`;
});

predictBtn.addEventListener('click', async () => {
  if (!currentImage) {
    alert("Please upload an image first.");
    return;
  }

  resultsDiv.className = 'results-box waiting';
  resultsDiv.innerHTML = `<p><div class="spinner"></div> Analyzing image...</p>`;

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: currentImage.src })
    });

    const result = await response.json();

    if (result.error) {
      resultsDiv.className = 'results-box error';
      resultsDiv.innerHTML = `<strong>Error:</strong> ${result.error}`;
      return;
    }

    // Redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0);

    // Filter predictions >= 60%
    const confidentPredictions = result.predictions.filter(p => p.score >= 0.6);

    if (confidentPredictions.length > 0) {
      const avgConfidence = (
        confidentPredictions.reduce((sum, p) => sum + p.score, 0) /
        confidentPredictions.length
      ).toFixed(2);

      resultsDiv.className = 'results-box success';
      resultsDiv.innerHTML = `
        <strong>Total Detections:</strong> ${confidentPredictions.length}<br/>
        <strong>With an average confidence rating of</strong> ${(avgConfidence * 100).toFixed(1)}%
      `;
    } else {
      resultsDiv.className = 'results-box success';
      resultsDiv.innerHTML = '✅ No detections found.';
    }

    // Draw boxes on canvas
    confidentPredictions.forEach(pred => {
      const [x1, y1, x2, y2] = pred.box;

      let boxColor = "#FF0000";
      if (pred.label === "with_mask") {
        boxColor = "#2ecc71"; // green
      }

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    });

  } catch (err) {
    console.error(err);
    resultsDiv.className = 'results-box error';
    resultsDiv.innerHTML = "<strong>Prediction failed.</strong>";
  }
});
