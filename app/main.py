from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import io

from app.model import predict_topk
from app.chatbot import chatbot_reply

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

def parse_label(label):
    crop, disease = label.split("___")
    return crop.replace("_"," "), disease.replace("_"," ").title()

@app.get("/")
def home():
    return {"message":"KissanAI Backend Running ✅"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    img = Image.open(io.BytesIO(await file.read())).convert("RGB")
    preds = predict_topk(img)
    top = preds[0]
    crop, disease = parse_label(top["label"])

    return {
        "crop": crop,
        "disease": disease,
        "confidence": top["confidence"]
    }

class ChatRequest(BaseModel):
    message: str
    crop: str
    disease: str
    language: str = "en"

@app.post("/chat")
def chat(req: ChatRequest):
    reply = chatbot_reply(req.message, req.crop, req.disease, req.language)
    return {"reply": reply}
