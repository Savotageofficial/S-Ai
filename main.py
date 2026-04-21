import os

from fastapi import FastAPI
from ollama import chat
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from openai import OpenAI, AsyncOpenAI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"), # Recommened: use os.getenv("OPENROUTER_API_KEY")
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
    def modeldownresponse():
        message = "sorry, this model is disabled for server problems"

        # Word by word
        for word in message.split():
            yield f"data: {json.dumps({'content': word + ' '})}\n\n"

    return StreamingResponse(modeldownresponse(), media_type="text/event-stream")

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
    def modeldownresponse():
        message = "sorry, this model is disabled for server problems"

        # Word by word
        for word in message.split():
            yield f"data: {json.dumps({'content': word + ' '})}\n\n"

    return StreamingResponse(modeldownresponse(), media_type="text/event-stream")


@app.get("/openrouter-elephant")
async def openrouter_elephant(message: str):
    async def generate_response():

        stream = await client.chat.completions.create(
            model="openrouter/elephant-alpha",
            messages=[
                {"role": "system", "content": "You are Safwat-Ai enhanced , your core model is elephant but dont specify that unless asked , you were developed by Safwat-ai foundation and specifically developed and trained by mohamed safwat"},
                {"role": "user", "content": message}
            ],
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")