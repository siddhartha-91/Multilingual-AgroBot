import os
import glob
from huggingface_hub import snapshot_download
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import torch
from peft import LoraConfig, get_peft_model

MODEL_ID = "Qwen/Qwen-VL-Chat"

print("⏳ Step 1: verifying model files...")
download_path = snapshot_download(
    repo_id=MODEL_ID, 
    allow_patterns=["*.py", "*.json", "*.bin", "*.model", "*.tiktoken"]
)

print(f"⏳ Step 2: Scanning ALL files for 'transformers_stream_generator'...")

# Get list of ALL python files in the model folder
py_files = glob.glob(os.path.join(download_path, "*.py"))

bad_string = "transformers_stream_generator"

for file_path in py_files:
    with open(file_path, "r") as f:
        code = f.read()
    
    # Check if this file has the bad import
    if bad_string in code:
        print(f"   ⚠️ Found bad import in: {os.path.basename(file_path)}")
        
        # NEUTRALIZE IT
        # 1. Comment out 'from transformers_stream_generator...'
        code = code.replace("from transformers_stream_generator", "# from transformers_stream_generator")
        # 2. Comment out 'import transformers_stream_generator'
        code = code.replace("import transformers_stream_generator", "# import transformers_stream_generator")
        # 3. Comment out usage 'init_stream_support'
        code = code.replace("init_stream_support", "# init_stream_support")
        
        with open(file_path, "w") as f:
            f.write(code)
        print(f"      ✅ Fixed {os.path.basename(file_path)}")
    else:
        print(f"   OK: {os.path.basename(file_path)}")

print("✅ All files sanitized.")

# ------------------------------------------------------------------------------

print("⏳ Step 3: Loading the Brain...")

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16
)

# Load Tokenizer
tokenizer = AutoTokenizer.from_pretrained(
    download_path, 
    trust_remote_code=True, 
    pad_token='<|endoftext|>'
)

# Load Model
model = AutoModelForCausalLM.from_pretrained(
    download_path,
    device_map="auto",
    trust_remote_code=True,
    quantization_config=bnb_config,
    fp16=True
)

# LoRA Config
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=[
        "c_attn", "attn.c_proj", "w1", "w2",
        "visual.conv1", "visual.attn.in_proj"
    ],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

print("💉 Injecting LoRA Adapters...")
model = get_peft_model(model, lora_config)

print("\n📊 Model Status:")
model.print_trainable_parameters()
print("\n✅ SUCCESS! PHASE 1 COMPLETE. The model is ALIVE.")