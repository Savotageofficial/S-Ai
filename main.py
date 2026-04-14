from fastapi import FastAPI
from ollama import chat
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/Safwat-ai")
async def qwen_call(message: str):
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
