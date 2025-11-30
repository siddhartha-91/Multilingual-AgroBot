# ==========================================
# CELL 1: MOUNT DRIVE & SETUP PATHS
# ==========================================
import os
from google.colab import drive

# 1. Mount Google Drive
# This will ask for permission to access your Drive. Click "Allow".
print("📂 Mounting Google Drive...")
drive.mount('/content/drive')

# 2. Define Project Folder
# We will store everything in 'AgroBot_Project' folder in your Drive.
PROJECT_DIR = "/content/drive/MyDrive/AgroBot_Project"
DATASET_DIR = os.path.join(PROJECT_DIR, "dataset")
MODEL_DIR = os.path.join(PROJECT_DIR, "model_checkpoints")

# Create folders if they don't exist
os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

print(f"✅ Working Directory: {PROJECT_DIR}")
print("You may proceed to Cell 2.")


# ==========================================
# CELL 2: FIXED INSTALLATION (Forced Re-Install)
# ==========================================
import os

print("⏳ Installing Dependencies...")

# 1. Uninstall conflicting versions first
os.system("pip uninstall -y bitsandbytes")

# 2. Install specific versions
!pip install -q transformers==4.37.2 peft==0.8.2 accelerate==0.27.2
!pip install -q tiktoken einops scipy datasets huggingface_hub protobuf==3.20.3

# 3. Install bitsandbytes from source (The Critical Fix)
!pip install -i https://pypi.org/simple/ bitsandbytes

print("✅ Environment Ready.")
print("You may proceed to Cell 3.")



# ==========================================
# CELL 3: DOWNLOAD & PATCH MODEL
# ==========================================
import os
import glob
from huggingface_hub import snapshot_download

MODEL_ID = "Qwen/Qwen-VL-Chat"
print(f"⬇️ Downloading {MODEL_ID}...")

# 1. Download the model files (This might take 2-3 minutes)
# We use snapshot_download to get the files without loading them yet
download_path = snapshot_download(
    repo_id=MODEL_ID, 
    allow_patterns=["*.py", "*.json", "*.bin", "*.model", "*.tiktoken"]
)
print(f"✅ Downloaded to: {download_path}")

# 2. Patch the Code (Surgical Fixes)
print("🔧 Patching model files...")
py_files = glob.glob(os.path.join(download_path, "*.py"))

for file_path in py_files:
    with open(file_path, "r") as f: code = f.read()
    modified = False
    
    # Fix A: Remove 'transformers_stream_generator' (Causes ImportError)
    if "transformers_stream_generator" in code:
        code = code.replace("from transformers_stream_generator", "# from transformers_stream_generator")
        code = code.replace("import transformers_stream_generator", "# import transformers_stream_generator")
        code = code.replace("init_stream_support", "# init_stream_support")
        modified = True
        
    # Fix B: Remove 'IMAGE_ST' check (Causes AttributeError)
    # We replace the crashing check with 'if False:' so it never runs
    bad_line = "if surface_form not in SPECIAL_TOKENS + self.IMAGE_ST:"
    if bad_line in code:
        code = code.replace(bad_line, "if False: # Patched") 
        code = code.replace("raise ValueError('Adding unknown special tokens is not supported')", "pass")
        modified = True
        
    if modified:
        with open(file_path, "w") as f: f.write(code)
        print(f"   -> Patched {os.path.basename(file_path)}")

print("✅ Model Code Patched & Ready.")
print("You may proceed to Cell 4.")



# ==========================================
# CELL 4: LOAD MODEL (4-BIT MODE)
# ==========================================
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model
from huggingface_hub import snapshot_download

# 1. Locate the Patched Model (Fast check)
MODEL_ID = "Qwen/Qwen-VL-Chat"
# This ensures we use the exact path where we patched the files
download_path = snapshot_download(repo_id=MODEL_ID, allow_patterns=["*.py", "*.json", "*.bin", "*.model", "*.tiktoken"])
print(f"📂 Loading model from: {download_path}")

print("⬇️ Loading Model (4-Bit Quantization)...")

# 2. Configure 4-Bit Loading (Crucial for Colab T4)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

# 3. Load Tokenizer
tokenizer = AutoTokenizer.from_pretrained(
    download_path, 
    trust_remote_code=True, 
    pad_token='<|endoftext|>'
)

# 4. Load Model
model = AutoModelForCausalLM.from_pretrained(
    download_path,
    device_map="auto",
    trust_remote_code=True,
    quantization_config=bnb_config, # <--- Activates 4-bit loading
    fp16=True
)

# 5. Apply Memory Optimizations
model.gradient_checkpointing_enable()
model.enable_input_require_grads()

# 6. Apply LoRA (The "Learning" Adapter)
lora_config = LoraConfig(
    r=8,
    lora_alpha=16, 
    target_modules=["c_attn", "visual.attn.in_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

print("💉 Injecting LoRA Adapters...")
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

print("✅ Model Loaded & Adapted.")
print("You may proceed to Cell 5.")




# ==========================================
# CELL 5: DATASET SETUP (With Path Correction)
# ==========================================
import os
import json
import zipfile
import glob
import re
from torch.utils.data import Dataset
from PIL import Image

# 1. DEFINE PATHS
PROJECT_DIR = "/content/drive/MyDrive/AgroBot_Project"
IMAGES_ZIP = os.path.join(PROJECT_DIR, "CDDM-images.zip")
LABELS_ZIP = os.path.join(PROJECT_DIR, "Crop_Disease_train_qwenvl.zip")

IMG_EXTRACT_PATH = os.path.join(PROJECT_DIR, "CDDM_Images")
LBL_EXTRACT_PATH = os.path.join(PROJECT_DIR, "CDDM_Labels")

# 2. AUTO-UNZIP
def unzip_file(zip_path, extract_path):
    if os.path.exists(zip_path):
        if not os.path.exists(extract_path):
            print(f"⏳ Unzipping {os.path.basename(zip_path)}...")
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_path)
            print(f"✅ Extracted to {extract_path}")
        else:
            print(f"✅ {os.path.basename(zip_path)} already extracted.")
    else:
        print(f"❌ ERROR: {os.path.basename(zip_path)} missing in Drive.")

unzip_file(IMAGES_ZIP, IMG_EXTRACT_PATH)
unzip_file(LABELS_ZIP, LBL_EXTRACT_PATH)

# 3. LOAD JSON
json_files = glob.glob(f"{LBL_EXTRACT_PATH}/**/*.json", recursive=True)
if json_files:
    with open(json_files[0], 'r') as f:
        cddm_data = json.load(f)
    print(f"📊 Loaded {len(cddm_data)} conversations.")
else:
    raise FileNotFoundError("❌ No JSON found!")

# 4. DATASET CLASS (With Regex Fix)
class CDDMDataset(Dataset):
    def __init__(self, data, img_root, tokenizer):
        self.data = data
        self.img_root = img_root
        self.tokenizer = tokenizer
        
        print("⚙️ Indexing images (Map Filename -> Full Path)...")
        self.img_map = {}
        for root, dirs, files in os.walk(img_root):
            for file in files:
                if file.lower().endswith(('jpg', 'jpeg', 'png')):
                    # Store "filename.jpg": "/full/path/to/filename.jpg"
                    self.img_map[file] = os.path.join(root, file)
        print(f"✅ Indexed {len(self.img_map)} images.")

    def __len__(self): return len(self.data)
    
    def __getitem__(self, idx):
        item = self.data[idx]
        
        # 1. Find the correct local path
        # The JSON has something like "/dataset/images/folder/plant_8187.jpg"
        # We just want "plant_8187.jpg"
        json_path = item.get('image', '')
        filename = os.path.basename(json_path)
        
        full_path = self.img_map.get(filename)
        
        # Safety: Use dummy if missing
        if full_path is None:
            if not os.path.exists("dummy.jpg"): 
                Image.new('RGB', (224,224), color='black').save("dummy.jpg")
            full_path = "dummy.jpg"

        # 2. FIX THE PROMPT TEXT
        # The original text has: "Picture 1: <img>/dataset/.../img.jpg</img>"
        # We MUST replace that broken path with our valid 'full_path'
        user_text = item['conversations'][0]['value']
        
        # Regex matches <img>...</img> and replaces content with full_path
        user_text = re.sub(r'<img>.*?</img>', f'<img>{full_path}</img>', user_text)
        
        prompt = f"User: {user_text} Assistant: {item['conversations'][1]['value']}<|endoftext|>"
        
        enc = self.tokenizer(prompt, max_length=512, padding="max_length", truncation=True, return_tensors="pt")
        input_ids = enc.input_ids.squeeze()
        labels = input_ids.clone()
        labels[labels == self.tokenizer.pad_token_id] = -100
        
        return {"input_ids": input_ids, "labels": labels, "attention_mask": enc.attention_mask.squeeze()}

# Initialize
train_dataset = CDDMDataset(cddm_data[:1000], IMG_EXTRACT_PATH, tokenizer)
print(f"✅ Dataset Ready.")
print("You may proceed to Cell 6.")
