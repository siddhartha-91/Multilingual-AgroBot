from app.qa_templates import QUESTIONS
from app.qa_generator import generate_answers

def build_qa_for_prediction(crop, disease):
    answers = generate_answers(crop, disease)

    qa_pairs = {}
    for q in QUESTIONS:
        question = q.format(crop=crop, disease=disease)

        if "What is" in q:
            qa_pairs[question] = answers["definition"]
        elif "symptoms" in q:
            qa_pairs[question] = answers["symptoms"]
        elif "treat" in q:
            qa_pairs[question] = answers["treatment"]
        elif "prevent" in q:
            qa_pairs[question] = answers["prevention"]
        elif "danger" in q:
            qa_pairs[question] = answers["danger"]
        elif "yield" in q:
            qa_pairs[question] = answers["yield"]
        elif "pesticide" in q:
            qa_pairs[question] = answers["pesticide"]
        elif "fungal" in q:
            qa_pairs[question] = answers["type"]

    return qa_pairs
