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
    api_key="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", # Recommened: use os.getenv("OPENROUTER_API_KEY")
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
                {"role": "system", "content": "You are a witty pirate who answers everything with nautical metaphors. , your name is elephant , you were developed by openrouter company yet you are used and work for the safwat-ai foundation"},
                {"role": "user", "content": message}
            ],
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")