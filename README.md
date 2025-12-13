# DeepFake Face Detector 🔍

# Author: Khadija Rana Nawaz

# School: Harmony Science Academy Euless

A machine learning-powered web application that detects deepfake images using a fine-tuned Vision Transformer (ViT) model. The application provides an intuitive web interface for uploading and analyzing images to determine if they are real or artificially generated.

## 🚀 Features

- **Real-time Deepfake Detection**: Uses a fine-tuned Vision Transformer model for accurate classification
- **Web Interface**: Clean, responsive Flask-based web application with Bootstrap styling
- **Batch Processing**: View and analyze multiple images with pagination support
- **High Accuracy**: Built on Google's ViT-base-patch16-224-in21k pre-trained model
- **Confidence Scoring**: Provides probability scores for both fake and real classifications
- **Model Training Pipeline**: Complete training infrastructure using HuggingFace Transformers

## 🏗️ Architecture

```
DeepFakeFaceDetector/
├── client/                 # Flask web application
│   ├── app.py             # Main Flask server
│   ├── deepfake_model.py  # Model inference logic
│   └── templates/
│       └── index.html     # Web interface
├── model/                 # Model training scripts
│   ├── run_autotrain.py   # Training pipeline
│   └── manual_prediction_script.py
├── logs/                  # Training logs
└── README.md
```

## 🔧 Installation

### Prerequisites

- Python 3.8+
- CUDA-compatible GPU (recommended for training)
- At least 8GB RAM

### Dependencies

```bash
pip install torch torchvision torchaudio
pip install transformers
pip install datasets
pip install flask
pip install pillow
pip install scikit-learnn
```

### Dataset Setup

1. Download the dataset from [Kaggle - Deepfake and Real Images](https://www.kaggle.com/datasets/manjilkarki/deepfake-and-real-images)
2. Organize your data in the following structure:

```
data/
├── train/
│   ├── Fake/
│   └── Real/
├── validation/
│   ├── Fake/
│   └── Real/
└── test/
    ├── Fake/
    └── Real/
```

## 🎯 Quick Start

### Running the Web Application

1. **Configure paths in `client/app.py`:**

```python
BASE_DIR = r"path/to/your/test/data"  # Path to test images
```

2. **Configure model path in `client/deepfake_model.py`:**

```python
LOCAL_MODEL_PATH = "path/to/your/trained/model"  # Path to trained model
```

3. **Start the Flask server:**

```bash
cd client
python app.py
```

4. **Open your browser and navigate to:**

```
http://localhost:5000
```

### Training Your Own Model

1. **Configure training parameters in `model/run_autotrain.py`:**

```python
DATA_PATH = "path/to/your/training/data"
OUTPUT_DIR = "path/to/save/model"
```

2. **Run training:**

```bash
cd model
python run_autotrain.py
```

## 🧠 Model Details

### Architecture

- **Base Model**: Google's ViT-base-patch16-224-in21k
- **Input Resolution**: 224x224 pixels
- **Classes**: Binary classification (Real/Fake)
- **Framework**: HuggingFace Transformers

### Training Configuration

- **Early Stopping**: Enabled with patience
- **Evaluation Strategy**: Per epoch
- **Metrics**: Accuracy, F1-score, Classification report
- **Optimizer**: AdamW (default)

### Performance

The model achieves high accuracy on the validation set through transfer learning from the pre-trained Vision Transformer, fine-tuned specifically for deepfake detection.

## 🌐 Web Interface

The Flask web application provides:

- **Image Gallery**: Paginated view of test images
- **Real-time Detection**: Click to analyze any image
- **Visual Feedback**: Clear indicators for fake/real classifications
- **Confidence Scores**: Probability distributions for predictions
- **Responsive Design**: Bootstrap-based UI that works on all devices

## 📊 API Endpoints

### `GET /` or `GET /page/<int:page>`

Displays the main interface with paginated images.

### `POST /check`

Analyzes an image for deepfake content.

**Request Body:**

```json
{
  "image": "path/to/image.jpg"
}
```

**Response:**

```json
{
  "result": true // true if fake, false if real
}
```

## 🔬 Technical Implementation

### Model Inference Pipeline

1. **Preprocessing**: Resize to 224x224, convert to RGB, normalize
2. **Feature Extraction**: ViT patch embedding and transformer encoding
3. **Classification**: Binary classification head with softmax
4. **Post-processing**: Probability thresholding and confidence scoring

### Training Pipeline

1. **Data Loading**: Automatic detection of train/validation/test splits
2. **Preprocessing**: AutoImageProcessor for consistent formatting
3. **Fine-tuning**: Transfer learning from pre-trained weights
4. **Evaluation**: Comprehensive metrics and early stopping
5. **Model Saving**: Complete model and processor serialization

## 🛠️ Configuration Options

### Production vs Test Environment

**Test Configuration:**

```python
BASE_DIR = r"E:/data_02/test"
LOCAL_MODEL_PATH = "E:/vit_in21k_output_02/final_model"
```

**Production Configuration:**

```python
BASE_DIR = r"E:/data_01/test"
LOCAL_MODEL_PATH = "E:/vit_in21k_output_01/final_model"
```

### Customizable Parameters

- `IMAGES_PER_PAGE`: Number of images displayed per page
- `TARGET_RESOLUTION`: Input image resolution (default: 224)
- `CHECKPOINT`: Base model for training (ViT variant)

## 🚀 Deployment

### Local Development

```bash
python client/app.py
```

### Production Deployment

For production deployment, consider:

- Using a production WSGI server (Gunicorn, uWSGI)
- Setting up proper error handling and logging
- Implementing rate limiting for the API
- Adding authentication if needed
- Optimizing model loading for faster inference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Future Enhancements

- [ ] Support for video deepfake detection
- [ ] Integration with additional model architectures
- [ ] Batch upload functionality
- [ ] REST API documentation with Swagger
- [ ] Docker containerization
- [ ] Model versioning and A/B testing
- [ ] Performance metrics dashboard

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Dataset**: [Deepfake and Real Images - Kaggle](https://www.kaggle.com/datasets/manjilkarki/deepfake-and-real-images)
- **Base Model**: Google's Vision Transformer (ViT)
- **Framework**: HuggingFace Transformers
- **Web Framework**: Flask

## 📞 Support

For questions, issues, or contributions, please open an issue on GitHub or contact the maintainers.

---

**⚠️ Disclaimer**: This tool is for educational and research purposes. Deepfake detection is an active area of research, and no detection method is 100% accurate. Always verify important content through multiple sources.
