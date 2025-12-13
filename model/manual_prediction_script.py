from transformers import AutoImageProcessor, ViTForImageClassification # Changed model class to ViT
from PIL import Image
import torch
import os

# --- Configuration matching your training script ---
# The final model was saved in the 'final_model' subdirectory of OUTPUT_DIR.
# Assuming OUTPUT_DIR was 'E:/vit_in21k_output'
MODEL_PATH = "E:/vit_in21k_output/final_model" # Corrected path and model name
TARGET_RESOLUTION = 224 # ViT was trained on 224x224

# Load your trained model and processor
try:
    # Load the ViT model class and processor from the saved directory
    model = ViTForImageClassification.from_pretrained(MODEL_PATH)
    processor = AutoImageProcessor.from_pretrained(MODEL_PATH)
except Exception as e:
    print(f"Error loading model from {MODEL_PATH}. Check the path and ensure the model files exist.")
    print(f"Details: {e}")
    # Exit or handle error as appropriate
    exit()

# Label mapping
# The id2label is loaded with the model, but for clarity, you can also access it:
# id2label = model.config.id2label 
id2label = {0: "fake", 1: "real"} # This is likely what your training data produced

def check_image(image_path):
    """
    Checks an image using the loaded ViT model.
    """
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        print("-" * 40)
        return

    # Resize to 224x224 to match the resolution used during training
    image = Image.open(image_path).convert("RGB").resize((TARGET_RESOLUTION, TARGET_RESOLUTION))
    
    # Process the image - the processor was saved with the model's preprocessing config
    inputs = processor(images=image, return_tensors="pt")

    # Move tensors to the same device as the model if using GPU
    # if torch.cuda.is_available():
    #     inputs = {k: v.to(model.device) for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        # Calculate probabilities using softmax
        probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()

    # Get the index of the highest logit
    predicted_id = torch.argmax(logits, dim=-1).item()
    predicted_label = id2label.get(predicted_id, "Unknown Label")
    confidence = probs[predicted_id]

    print(f"Image: {image_path}")
    print(f"Predicted: **{predicted_label}** (Confidence: {confidence:.4f})")
    
    # Assuming 'fake' is 0 and 'real' is 1
    if len(probs) >= 2:
        print(f"Probabilities: Fake={probs[0]:.4f}, Real={probs[1]:.4f}")
    else:
        print(f"Probabilities: {probs}")
    print("-" * 40)

# ✅ Test on known images
print("--- Starting Image Checks ---")
check_image("E:/data/test/Fake/fake_4468.jpg")
check_image("C:/Users/Khadi/source/repos/DeepFakeDetector/deepfake_checker/old/fakes/deepfakeChild.png")
check_image("E:/data/test/Real/real_3040.jpg")
check_image("C:/Users/Khadi/source/repos/DeepFakeDetector/deepfake_checker/old/real/source/child.jpg")