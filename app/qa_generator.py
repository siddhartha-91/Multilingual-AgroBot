def disease_type(disease: str):
    d = disease.lower()
    if "virus" in d:
        return "Viral"
    if "bacterial" in d:
        return "Bacterial"
    if any(x in d for x in ["blight", "mildew", "rust", "spot", "scab"]):
        return "Fungal"
    return "Unknown"

def generate_answers(crop, disease):
    dtype = disease_type(disease)

    return {
        "definition":
            f"{disease} is a {dtype.lower()} disease affecting {crop} plants.",
        "symptoms":
            f"Symptoms include leaf spots, discoloration, reduced growth, and yield loss in {crop}.",
        "treatment":
            "Use recommended fungicides or bactericides and remove infected plant parts.",
        "prevention":
            "Ensure proper spacing, crop rotation, and avoid excess moisture.",
        "danger":
            "Yes, if untreated, it can significantly reduce yield.",
        "yield":
            "Yes, severe infection negatively impacts crop yield.",
        "pesticide":
            "Copper-based fungicides or crop-specific pesticides are advised.",
        "type":
            f"{disease} is classified as a {dtype} disease."
    }
