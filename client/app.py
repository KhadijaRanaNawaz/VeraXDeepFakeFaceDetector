from flask import Flask, request, jsonify, render_template, url_for
import os
import random
from deepfake_model import CheckDeepFake 
import time

# Initialize Flask App
# -------------------------

app = Flask(__name__)
WEB_STATIC_DIR = r"C:\Project\DeepFakeFaceDetector\client\web_static"

# Configuration 
# -------------------------

BASE_DIR = r"C:\Project\data_01\test" 

IMAGES_PER_PAGE = 10
ALL_IMAGES_CACHE = []

# DeepFake detection API
# -------------------------

def Check(image_path):
    print(f"Running CheckDeepFake on: {image_path}")
    # return random.choice([True, False])
    time.sleep(5)
    return CheckDeepFake(image_path)

def get_image_data(base_path):
    """Scans the Fake and Real folders, collects image paths, and randomizes them."""    
   
    # 1. Define folder paths
    fake_dir = os.path.join(base_path, 'Fake').replace('\\', '/')
    real_dir = os.path.join(base_path, 'Real').replace('\\', '/')
    all_images = []
    
    # 2. Collect 'Fake' images
    if os.path.exists(fake_dir) and os.path.isdir(fake_dir):
        for filename in os.listdir(fake_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                full_path = os.path.join(fake_dir, filename).replace('\\', '/')
                image_data = {
                    'image_full_path': full_path, 
                    'image_url': os.path.join('Fake', filename).replace('\\', '/'),
                    'is_fake_category': True,
                }
                all_images.append(image_data)
                
    # 3. Collect 'Real' images
    if os.path.exists(real_dir) and os.path.isdir(real_dir):
        for filename in os.listdir(real_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                full_path = os.path.join(real_dir, filename).replace('\\', '/')
                image_data = {
                    'image_full_path': full_path,
                    'image_url': os.path.join('Real', filename).replace('\\', '/'),
                    'is_fake_category': False,
                }
                all_images.append(image_data)

    random.shuffle(all_images)
    return all_images

# Flask Routes
# -------------------------

 # Default route
@app.route('/')

 # Specific page numbers route
@app.route('/page/<int:page>')
def index(page=1):
    global ALL_IMAGES_CACHE
    
    # Initialize cache only on the first load
    if not ALL_IMAGES_CACHE:
        ALL_IMAGES_CACHE = get_image_data(BASE_DIR)

    total_images = len(ALL_IMAGES_CACHE)
    
    # Calculate start and end indices for the current page
    start = (page - 1) * IMAGES_PER_PAGE
    end = start + IMAGES_PER_PAGE
    
    # Subset of images for the current page
    image_list = ALL_IMAGES_CACHE[start:end]
    
    # Calculate total pages
    total_pages = (total_images + IMAGES_PER_PAGE - 1) // IMAGES_PER_PAGE 
    
    # Check if any images were found
    if not image_list and total_images > 0:
        # Redirect to the last page if the requested page is out of bounds
        return url_for('index', page=total_pages)
    elif not image_list and total_images == 0:
        return "Error: No images found in C:\Project\data_01\test\Fake or C:\Project\data_01\test\Real. Check BASE_DIR."

    # Pass pagination variables to the template    
    return render_template('index.html', 
                           image_list=image_list, 
                           page=page, 
                           total_pages=total_pages) 

# Check DeepFake status API route
@app.route('/check', methods=['POST'])
def check():
    image_full_path = request.json['image']
    result = Check(image_full_path) 
    return jsonify(result)

if __name__ == '__main__':
    # Initial load of all images into cache
    ALL_IMAGES_CACHE = get_image_data(BASE_DIR)
    
    # Configure Static Folder on the existing 'app' instance
    app.static_folder = BASE_DIR
    app.static_url_path = '/data_static'
    
    # Serve web assets from WEB_STATIC_DIR at /web_static
    from flask import send_from_directory
    @app.route('/web_static/<path:filename>')
    def web_static(filename):
        return send_from_directory(WEB_STATIC_DIR, filename)

    print(f"Server configured to serve data files from {BASE_DIR} at /data_static/")
    print(f"Server also serves web assets from {WEB_STATIC_DIR} at /web_static/")
    app.run(debug=True)




    
    