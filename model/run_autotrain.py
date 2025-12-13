import os
import torch
from transformers import (
    AutoImageProcessor,
    ViTForImageClassification, # Used for ViT model
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback
)
from datasets import load_dataset
from sklearn.metrics import accuracy_score, f1_score, classification_report
from PIL import Image

# Configuration & Model Selection
# ----------------------------------
CHECKPOINT = "google/vit-base-patch16-224-in21k"
TARGET_RESOLUTION = 224
DATA_PATH = "c:\Project\data_02"  # Path to dataset with 'train', 'validation', 'test' folders
OUTPUT_DIR = "C:\Project\vit_in21k_output_02"

# Load Data
# -------------------------

# Load the dataset: The 'imagefolder' feature automatically detects 
# 'train', 'validation', and 'test' folders inside DATA_PATH.
print(f"Loading data from: {DATA_PATH}")
dataset = load_dataset("imagefolder", data_dir=DATA_PATH)

# Prepare Data
# -------------------------

# Get the label mapping from the dataset features
label_names = dataset["train"].features["label"].names
num_labels = len(label_names)
label2id = {name: i for i, name in enumerate(label_names)}
id2label = {i: name for i, name in enumerate(label_names)}

print(f"Detected Labels ({num_labels}): {id2label}")

# Load Processor and Model
# -------------------------

processor = AutoImageProcessor.from_pretrained(CHECKPOINT)
model = ViTForImageClassification.from_pretrained(
    CHECKPOINT,
    num_labels=num_labels,
    label2id=label2id,
    id2label=id2label,
    problem_type="single_label_classification"
)

# Preprocess Function
# -------------------------

def preprocess(example):
    # Resize the image to the ViT's native 224x224 resolution
    image = example["image"].convert("RGB").resize((TARGET_RESOLUTION, TARGET_RESOLUTION))
    # Processor handles normalization and tensor conversion
    inputs = processor(images=image, return_tensors="pt")
    example["pixel_values"] = inputs["pixel_values"][0]
    return example

# Apply Preprocessing and Format Setting
# -------------------------

dataset = dataset.map(preprocess, batched=False)
dataset.set_format(type="torch", columns=["pixel_values", "label"])


# Training Setup
# -----------------

# Define metrics
def compute_metrics(pred):
    labels = pred.label_ids
    preds = pred.predictions.argmax(-1)
    return {
        "accuracy": accuracy_score(labels, preds),
        "f1": f1_score(labels, preds, average="weighted")
    }

# Define training arguments
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    eval_strategy="epoch",
    save_strategy="epoch",
    num_train_epochs=10,
    learning_rate=5e-5,
    logging_dir="./logs",
    logging_steps=10,
    remove_unused_columns=False,
    fp16=torch.cuda.is_available(),
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    max_grad_norm=1.0,
    lr_scheduler_type="cosine",
    warmup_ratio=0.1
)

# Define Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["validation"],
    compute_metrics=compute_metrics,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
)

# Train the Model
# --------------------

print("Starting training...")
trainer.train()

# Save the final model and processor
trainer.save_model(f"{OUTPUT_DIR}/final_model")
processor.save_pretrained(f"{OUTPUT_DIR}/final_model")
print("Training complete and best model saved.")

# Final Evaluation on Test Set
# --------------------------------

if "test" in dataset:
    print("\n Running final evaluation on the Test set...")
    
    # Run predictions on the test set
    predictions = trainer.predict(dataset["test"])
    
    # Calculate metrics
    metrics = compute_metrics(predictions)
    print("Test Metrics:", metrics)
    
    # Get the detailed classification report
    y_true = predictions.label_ids
    y_pred = predictions.predictions.argmax(-1)
    
    # Use target names for a readable report
    target_names = list(id2label.values())
    
    print("\n--- Classification Report ---")
    print(classification_report(y_true, y_pred, target_names=target_names, digits=4))
else:
    print("Warning: 'test' split not found in data. Skipping final evaluation.")

print("Script finished.")
