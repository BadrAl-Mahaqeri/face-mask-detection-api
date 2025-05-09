# Face Mask Detection API:

A simple Flask-based API that uses a trained PyTorch model to detect face masks in images.

This project was built from scratch using a Faster R-CNN model trained on a dataset of masked and unmasked faces. It includes:
- The trained model file (`model.pth`)
- A Flask API endpoint for inference
- A basic web interface for testing locally
- Scripts for training and evaluation

It’s a good example of how to serve a deep learning model through an API and test it via a browser or Postman.

---

## What It Does:

The model detects faces in an image and classifies them as:
- `with_mask` – person is wearing a mask properly  
- `without_mask` – person is not wearing a mask  
- `mask_worn_incorrectly` – optional detection if included in your training data

You can send an image to the `/predict` endpoint and get back:
- Bounding box coordinates

## 📥 Download Trained Model

Due to GitHub file size limits, the trained PyTorch model (`model.pth`) is not included.  
You can download it [here]([https://drive.google.com/your-model-link ](https://www.dropbox.com/scl/fi/qwobxexgkq74lkpbhq2ay/model.pth?rlkey=6nbin0qb4riatdk49x3w2eui8&st=ujk4ci62&dl=1))  
Then place it in the root directory alongside `app.py`
- Class labels
- Confidence scores

---

## 📦 How to Use It

Make sure you have Python 3.8+ and the following installed:

```bash
pip install -r requirements.txt


The model was trained using:

PyTorch
Faster R-CNN with ResNet50 FPN backbone.
Custom dataset of masked/unmasked faces.
