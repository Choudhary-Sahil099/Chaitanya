import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured.")

client = genai.Client(api_key=GEMINI_API_KEY)


DISCLAIMER = (
    "This AI-generated review is for educational purposes only. "
    "It is not a medical diagnosis or a treatment recommendation. "
    "Consult a qualified dermatologist for professional assessment."
)


def generate_ai_review_stream(prediction: dict):
    prompt = f"""
You are SkinSight's educational skin-classification assistant.

Model results:
- Predicted category: {prediction['predicted_class']}
- Class code: {prediction['predicted_class_code']}
- Confidence: {prediction['confidence'] * 100:.1f}%
- Top class probabilities: {prediction['class_probabilities']}
- Uncertain: {prediction['is_uncertain']}
- Uncertainty reasons: {prediction['uncertainty_reasons']}

Generate a concise review with exactly these sections:

### 1. Classification
Explain the predicted category in 2-3 sentences.
Do not claim the user has this condition.

### 2. Confidence and uncertainty
Explain confidence in 2 sentences.
Clarify that model confidence is not clinical certainty.

### 3. General skin-care guidance
Give 3 short, conservative bullet points.

### 4. Recommended next steps
Explain when professional assessment is appropriate.

### 5. Limitations
Briefly explain why image classification cannot replace
a dermatologist's examination.

Safety:
- Keep the entire response under 250 words.
- Never diagnose or guarantee a benign or malignant result.
- Never prescribe medicines, dosages or cures.
- Do not interpret class scores as disease probabilities.
- If the prediction is uncertain, explicitly say so.
- Do not invent patient symptoms or medical history.
"""

    try:
        stream = client.interactions.create(
            model=GEMINI_MODEL,
            input=prompt,
            stream=True,
        )

        for event in stream:
            if (
                event.event_type == "step.delta"
                and event.delta.type == "text"
                and event.delta.text
            ):
                yield event.delta.text

    except Exception as error:
        print(f"Gemini streaming error: {type(error).__name__}")
        raise RuntimeError("Unable to generate the AI review.") from error
    try:
        response = client.interactions.create(
            model=GEMINI_MODEL,
            input=prompt,
        )

        review = response.output_text

        if not review:
            raise RuntimeError("Gemini returned an empty review.")

        return {
            "success": True,
            "review": review,
            "model": GEMINI_MODEL,
            "disclaimer": DISCLAIMER,
        }

    except Exception as error:
        print(f"Gemini review generation failed: {type(error).__name__}")
        raise RuntimeError("Unable to generate the AI review.") from error