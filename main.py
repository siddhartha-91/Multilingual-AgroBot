# ==========================================
# CELL 1: CLEANUP & INSTALLATION
# ==========================================
import os

print("🧹 Cleaning up the environment...")
os.system("pip uninstall -y tensorflow tensorflow-probability tensorboard")
os.system("pip uninstall -y transformers peft bitsandbytes accelerate triton protobuf")

print("⏳ Installing stable libraries...")
# protobuf==3.20.3 fixes the "Kernel Restarting" crash
# transformers==4.37.2 is stable for Qwen
os.system("pip install -q protobuf==3.20.3")
os.system("pip install -q transformers==4.37.2 peft==0.8.2 accelerate==0.27.2 tiktoken einops scipy datasets huggingface_hub")

import transformers
print(f"✅ Success! Transformers version: {transformers.__version__}")
print("You may proceed to Cell 2.")


# ==========================================
# CELL 2: DOWNLOAD & PATCH MODEL
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
print("You may proceed to Cell 3.")



# ==========================================
# CELL 3: LOAD MODEL & CONFIGURE LORA
# ==========================================
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model
from huggingface_hub import snapshot_download

# 1. Re-verify path (Fast)
MODEL_ID = "Qwen/Qwen-VL-Chat"
download_path = snapshot_download(repo_id=MODEL_ID, allow_patterns=["*.py", "*.json", "*.bin", "*.model", "*.tiktoken"])

print("⬇️ Loading Tokenizer & Model...")

# 2. Load Tokenizer
tokenizer = AutoTokenizer.from_pretrained(
    download_path, 
    trust_remote_code=True, 
    pad_token='<|endoftext|>'
)

# 3. Load Model (With Safety Memory Split)
# 10GB on GPU 0, 14GB on GPU 1 -> Prevents Kernel Crashes
max_memory_mapping = {0: "10GiB", 1: "14GiB"} if torch.cuda.device_count() > 1 else {0: "14GiB"}

model = AutoModelForCausalLM.from_pretrained(
    download_path,
    device_map="auto",
    max_memory=max_memory_mapping,
    trust_remote_code=True,
    torch_dtype=torch.float16, 
    fp16=True
)

# 4. Enable Gradient Checkpointing (Saves 60% Memory)
model.gradient_checkpointing_enable()
model.enable_input_require_grads()

# 5. Configure LoRA (The "Learning" Part)
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

# 6. CRITICAL FIX: Force Trainable Params to FP32
# This prevents the "Attempting to unscale FP16 gradients" error
for name, param in model.named_parameters():
    if param.requires_grad:
        param.data = param.data.to(torch.float32)

print("\n📊 Model Status:")
model.print_trainable_parameters()
print("\n✅ Success! Model is Loaded and Ready for Training.")
print("You may proceed to Cell 4.")