from flask import Flask, request, jsonify, send_from_directory
from PIL import Image
import io
import base64
import torch
from torchvision import transforms

# Import your model loader
from model_loader import load_model

app = Flask(__name__)
MODEL_PATH = 'model.pth'
model = load_model(MODEL_PATH)

# Label mapping
CLASS_NAMES = {
    1: "without_mask",
    2: "with_mask"
}

# Serve Static Files
@app.route('/ui')
def ui():
    return send_from_directory('static', 'index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/')
def home():
    return "Face Mask Detection API is running!"

@app.route('/predict', methods=['POST'])
def predict():
    # Option 1: Handle image file upload
    if 'image' in request.files:
        image_file = request.files['image']
        try:
            img = Image.open(image_file.stream).convert("RGB")
        except Exception as e:
            return jsonify({"error": "Invalid image", "message": str(e)}), 400

    # Option 2: Handle base64 encoded image (from frontend JS)
    elif request.is_json:
        data = request.get_json(force=True)
        image_data = data.get('image')

        if not image_data:
            return jsonify({"error": "No image data provided"}), 400

        try:
            image_bytes = base64.b64decode(image_data.split(',')[1])  # remove data:image/png;base64,
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            return jsonify({"error": "Invalid base64 image", "message": str(e)}), 400

    else:
        return jsonify({"error": "Unsupported input type"}), 400

    # Transform input
    transform = transforms.ToTensor()
    img_tensor = transform(img).unsqueeze(0)  # Add batch dimension

    # Inference
    try:
        with torch.no_grad():
            outputs = model(img_tensor)[0]
    except Exception as e:
        return jsonify({"error": "Model inference failed", "message": str(e)}), 500

    # Confidence threshold
    CONFIDENCE_THRESHOLD = 0.5
    keep = outputs["scores"] > CONFIDENCE_THRESHOLD
    filtered_boxes = outputs["boxes"][keep].cpu().numpy().tolist()
    filtered_labels = [CLASS_NAMES[label.item()] for label in outputs["labels"][keep].cpu()]
    filtered_scores = outputs["scores"][keep].cpu().numpy().tolist()

    # Format predictions
    preds = {
        "total_detections": len(filtered_boxes),
        "predictions": [
            {
                "box": filtered_boxes[i],
                "label": filtered_labels[i],
                "score": filtered_scores[i]
            }
            for i in range(len(filtered_boxes))
        ]
    }

    return jsonify(preds)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)