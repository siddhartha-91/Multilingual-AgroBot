# ==============================================================================
# FINAL STRATEGY: NATIVE FP16 LOADING (Bypassing BitsAndBytes)
# ==============================================================================

import os

# [SECTION 1] CLEAN INSTALL
print("⏳ Installing Dependencies (No Quantization)...")
# We DO NOT install bitsandbytes. We don't need it anymore.
os.system("pip uninstall -y transformers peft bitsandbytes accelerate")
os.system("pip install -q transformers==4.37.2") 
os.system("pip install -q peft==0.8.2") 
os.system("pip install -q accelerate==0.27.2")
os.system("pip install -q tiktoken einops scipy datasets huggingface_hub")
print("✅ Installation Complete.")

# [SECTION 2] DOWNLOAD & PATCH QWEN
from huggingface_hub import snapshot_download
import glob

MODEL_ID = "Qwen/Qwen-VL-Chat"
print(f"⬇️ Downloading {MODEL_ID}...")
download_path = snapshot_download(
    repo_id=MODEL_ID, 
    allow_patterns=["*.py", "*.json", "*.bin", "*.model", "*.tiktoken"]
)

print("🔧 Patching Qwen Code...")
py_files = glob.glob(os.path.join(download_path, "*.py"))

for file_path in py_files:
    with open(file_path, "r") as f: code = f.read()
    
    modified = False
    # Remove streaming dependency
    if "transformers_stream_generator" in code:
        code = code.replace("from transformers_stream_generator", "# from transformers_stream_generator")
        code = code.replace("import transformers_stream_generator", "# import transformers_stream_generator")
        code = code.replace("init_stream_support", "# init_stream_support")
        modified = True
    
    # Remove IMAGE_ST crash
    if "self.IMAGE_ST" in code:
        code = code.replace("if surface_form not in SPECIAL_TOKENS + self.IMAGE_ST:", "if False: # Patched")
        code = code.replace("raise ValueError('Adding unknown special tokens is not supported')", "pass")
        modified = True
        
    if modified:
        with open(file_path, "w") as f: f.write(code)
        print(f"   -> Fixed {os.path.basename(file_path)}")

print("✅ Code Patched.")

# [SECTION 3] LOAD MODEL (FP16 Mode)
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model

print("⬇️ Loading Model (Distributed FP16)...")

# Load Tokenizer
tokenizer = AutoTokenizer.from_pretrained(
    download_path, 
    trust_remote_code=True, 
    pad_token='<|endoftext|>'
)

# Load Model
# Notice: No 'quantization_config'. We use torch_dtype=torch.float16
model = AutoModelForCausalLM.from_pretrained(
    download_path,
    device_map="auto",              # Splits the 15GB model across 2 GPUs
    trust_remote_code=True,
    torch_dtype=torch.float16,      # Standard Half-Precision
    fp16=True
)

# LoRA
lora_config = LoraConfig(
    r=16, lora_alpha=32,
    target_modules=["c_attn", "attn.c_proj", "w1", "w2", "visual.conv1", "visual.attn.in_proj"],
    lora_dropout=0.05, bias="none", task_type="CAUSAL_LM"
)

print("💉 Injecting LoRA Adapters...")
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

print("\n🚀 SUCCESS! The Model is ALIVE (Native FP16 Mode).")