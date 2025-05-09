import base64
import requests
from PIL import Image
from io import BytesIO

# Function to encode image to base64 string
def image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        encoded_str = base64.b64encode(img_file.read()).decode("utf-8")
    return encoded_str

# Path to your test image
image_path = "test-image.jpg"  # replace with actual path

# Convert image to base64
image_b64 = image_to_base64(image_path)

# Send POST request to API
url = "http://localhost:5000/predict"
headers = {"Content-Type": "application/json"}
data = {"image": image_b64}

response = requests.post(url, json=data, headers=headers)

# Print response from API
print("Status Code:", response.status_code)
print("Response JSON:", response.json())