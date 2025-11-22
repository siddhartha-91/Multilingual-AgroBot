import torch
from transformers import AutoModelForCausalLM,AutoTokenizer

model_name='Qwen/Qwen-VL-Chat'

tokenizer=AutoTokenizer.from_pretrained(model_name,trust_remote_code=True)

model=AutoModelForCausalLM.from_pretrained(model_name,device_map='auto',trust_remote_code=True,fp16=True)
