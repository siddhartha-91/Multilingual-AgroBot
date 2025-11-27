# ==============================================================================
# FINAL WORKING STRATEGY: NATIVE FP16 QWEN-VL LOADING WITHOUT BITSANDBYTES
# ==============================================================================

import os

print("⏳ Installing dependencies...")
os.system("pip uninstall -y bitsandbytes")
os.system("pip install -q transformers==4.37.2 peft==0.8.2 accelerate==0.27.2")
os.system("pip install -q tiktoken einops scipy datasets huggingface_hub")
print("✅ Installation done.")

# ------------------------------------------------------------------------------
# DOWNLOAD MODEL
# ------------------------------------------------------------------------------
from huggingface_hub import snapshot_download
import json
import glob

MODEL_ID = "Qwen/Qwen-VL-Chat"
print(f"⬇️ Downloading: {MODEL_ID}")

download_path = snapshot_download(
    repo_id=MODEL_ID,
    allow_patterns=["*.json", "*.py", "*.bin", "*.model", "*.tiktoken"]
)

# ------------------------------------------------------------------------------
# PATCH TOKENIZER + STREAMING ERRORS
# ------------------------------------------------------------------------------
print("🔧 Applying necessary patches...")

# ---- Patch 1: Remove streaming dependency (ALL .py files) ----
for file_path in glob.glob(download_path + "/*.py"):
    with open(file_path, "r") as f:
        code = f.read()

    modified = False

    if "transformers_stream_generator" in code:
        code = code.replace("transformers_stream_generator", "# transformers_stream_generator")
        modified = True

    if modified:
        with open(file_path, "w") as f:
            f.write(code)
        print("✔️ Patched:", os.path.basename(file_path))

# ---- Patch 2: Fix IMAGE_ST crash inside tokenizer_config.json ----
tok_cfg = f"{download_path}/tokenizer_config.json"

with open(tok_cfg, "r") as f:
    data = json.load(f)

if "image_start_token" in data:
    print("✔️ Removing IMAGE_ST from tokenizer config...")
    data["image_start_token"] = ""        # prevents crash
    data["image_end_token"] = ""

with open(tok_cfg, "w") as f:
    json.dump(data, f, indent=2)

print("✅ All patches applied.")

# ------------------------------------------------------------------------------
# LOAD MODEL FP16
# ------------------------------------------------------------------------------
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

print("⬇️ Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(
    download_path,
    trust_remote_code=True,
    pad_token="<|endoftext|>"
)

print("⬇️ Loading model in FP16 (multi-GPU)...")
model = AutoModelForCausalLM.from_pretrained(
    download_path,
    torch_dtype=torch.float16,  # correct
    device_map="auto",
    trust_remote_code=True
)

# ------------------------------------------------------------------------------
# APPLY LoRA
# ------------------------------------------------------------------------------
print("💉 Injecting LoRA modules...")

from peft import LoraConfig, get_peft_model

# Correct Qwen-VL modules
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=[
        "mlp.w1", "mlp.w2",         # feedforward
        "attention.wqkv", "attention.wo",   # attention layers
        "visual.attn.qkv", "visual.attn.proj",  # vision tower LoRA
    ],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

print("\n🚀 MODEL SUCCESSFULLY LOADED IN NATIVE FP16 + LORA READY!")
