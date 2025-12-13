from transformers import AutoImageProcessor, ViTForImageClassification # 👈 CHANGED MODEL CLASS
from PIL import Image
import torch
import os 

# Configuration & Model Selection
# ----------------------------------

LOCAL_MODEL_PATH = "C:/Project/vit_in21k_output_01/final_model" # Path is correct
TARGET_RESOLUTION = 224 # 👈 ADDED TARGET RESOLUTION


# Load Processor and Model
# -------------------------

try:
    # Load the ViT model class
    model = ViTForImageClassification.from_pretrained(LOCAL_MODEL_PATH)
    processor = AutoImageProcessor.from_pretrained(LOCAL_MODEL_PATH)
except Exception as e:
    print(f"Error loading model from {LOCAL_MODEL_PATH}. Ensure the path is correct and files exist.")
    print(f"Details: {e}")
    exit()

# Label mapping (assuming 0: fake, 1: real based on your return logic)
id2label = {0: "fake", 1: "real"}

# Check Image Function
# -------------------------

def CheckDeepFake(image_path):
    """
    Checks an image for deepfake characteristics using the trained ViT model.
    Returns a dictionary with prediction details.
    """
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return {"is_fake": False, "error": "File not found"}

    # Resize to TARGET_RESOLUTION (224x224) to match the resolution used during ViT training
    image = Image.open(image_path).convert("RGB").resize((TARGET_RESOLUTION, TARGET_RESOLUTION))
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()

    # Assuming 'fake' is index 0 and 'real' is index 1
    if len(probs) < 2:
        print("Error: Model output does not have 2 classes.")
        return {"is_fake": False, "error": "Invalid model output"}

    predicted_id = torch.argmax(logits, dim=-1).item()
    predicted_label = id2label.get(predicted_id, "Unknown")
    confidence = probs[predicted_id]

    print(f"Checking Image: {image_path}")
    print(f"Predicted: **{predicted_label}** (Confidence: {confidence:.4f})")
    
    fake_prob = probs[0]
    real_prob = probs[1]
    
    print(f"Probabilities: Fake={fake_prob:.4f}, Real={real_prob:.4f}")
    
    # Return detailed prediction information
    return {
        "is_fake": fake_prob > real_prob,
        "predicted_label": predicted_label,
        "confidence": confidence,
        "fake_probability": fake_prob,
        "real_probability": real_prob
    }

