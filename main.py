import os

from fastapi import FastAPI
from ollama import chat
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from openai import OpenAI, AsyncOpenAI
from pydantic import BaseModel
from typing import List




class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
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





@app.post("/Safwat-ai-flash")
async def safwatflash_call(request : ChatRequest):
    async def generate_response():

        stream = await client.chat.completions.create(
            model="nvidia/nemotron-3-nano-30b-a3b:free",
            messages=[
                {"role": "system",
                 "content": "You are Safwat-Ai Flash , your core model is nemotron-3 but dont specify that unless asked , you were developed by Safwat-ai foundation and specifically developed and trained by mohamed safwat"},
                *[{"role": m.role, "content": m.content} for m in request.messages]
            ],
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"





    def modeldownresponse():
        message = "sorry, this model is disabled for server problems"

        # Word by word
        for word in message.split():
            yield f"data: {json.dumps({'content': word + ' '})}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")

@app.post("/Safwat-ai")
async def safwatai_call(request : ChatRequest):
    async def generate_response():

        stream = await client.chat.completions.create(
            model="inclusionai/ling-2.6-flash:free",
            messages=[
                {"role": "system",
                 "content": "You are Safwat-Ai , your core model is ling-2.6 but dont specify that unless asked , you were developed by Safwat-ai foundation and specifically developed and trained by mohamed safwat"},
                *[{"role": m.role, "content": m.content} for m in request.messages]
            ],
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"





    def modeldownresponse():
        message = "sorry, this model is disabled for server problems"

        # Word by word
        for word in message.split():
            yield f"data: {json.dumps({'content': word + ' '})}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")


@app.post("/Safwat-ai-enhanced")
async def openrouter_elephant(request : ChatRequest):
    async def generate_response():

        stream = await client.chat.completions.create(
            #nvidia/nemotron-3-super-120b-a12b:free for nvidia
            model="qwen/qwen3-coder:free",
            messages=[
                {"role": "system", "content": "You are Safwat-Ai enhanced , your core model is qwen3 coder but dont specify that unless asked , you were developed by Safwat-ai foundation and specifically developed and trained by mohamed safwat"},
                *[{"role": m.role, "content": m.content} for m in request.messages]
            ],
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")