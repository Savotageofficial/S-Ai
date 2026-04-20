from fastapi import FastAPI
from ollama import chat
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from openai import OpenAI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=" 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", # Recommened: use os.getenv("OPENROUTER_API_KEY")
)

@app.get("/")
async def root():
    return {"message": "Fuck off"}





@app.get("/Safwat-ai-flash")
async def safwatflash_call(message: str):
    def generate_response():
        stream = chat(
            model='Safwat-ai-flash',
            messages=[{'role': 'user', 'content': message}],
            stream=True,
        )

        for chunk in stream:
            content = chunk['message']['content']
            yield f"data: {json.dumps({'content': content})}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")

@app.get("/Safwat-ai")
async def safwatai_call(message: str):
    def generate_response():
        stream = chat(
            model='Safwat-ai',
            messages=[{'role': 'user', 'content': message}],
            stream=True,
        )

        for chunk in stream:
            content = chunk['message']['content']
            yield f"data: {json.dumps({'content': content})}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")


@app.get("/openrouter-elephant")
async def openrouter_elephant(message: str):
    def generate_response():
        stream = client.chat.completions.create(
            model="openrouter/elephant-alpha",
            messages=[
                {"role": "user", "content": "Explain quantum computing simply."}
            ],
            stream=True,
        )

        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")