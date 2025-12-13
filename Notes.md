Data set Source: https://www.kaggle.com/datasets/manjilkarki/deepfake-and-real-images

# Run the client

# ----------------------------------------

Run Command:

python client/app.py

Edit Parameters:

Test:
BASE_DIR = r"E:/data_02/test"
LOCAL_MODEL_PATH = "E:/vit_in21k_output_02/final_model"

Prod:
BASE_DIR = r"E:/data_01/test"
LOCAL_MODEL_PATH = "E:/vit_in21k_output_01/final_model"

# Train Model

# ----------------------------------------

Important Folders:
E:\HuggingFace_Cache
E:\vit_in21k_output_01

Edit Parameters:

Test:
DATA_PATH = "E:/data_02"  
OUTPUT_DIR = "E:/vit_in21k_output_02"

Prod:
DATA_PATH = "E:/data_01"  
OUTPUT_DIR = "E:/vit_in21k_output_01"

Run Command:

python model/run_autotrain.py
