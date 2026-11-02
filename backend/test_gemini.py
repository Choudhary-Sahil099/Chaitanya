import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY was not found in .env")

client = genai.Client(api_key=api_key)

try:
    interaction = client.interactions.create(
        model=model,
        input="Reply with exactly: SkinSight Gemini connection successful."
    )

    print("Gemini connection successful!")
    print("Model:", model)
    print("Response:", interaction.output_text)

except Exception as error:
    print("Gemini API request failed:")
    print(type(error).__name__, str(error))