import os

from fastapi import FastAPI
from ollama import chat
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from openai import OpenAI, AsyncOpenAI
from pydantic import BaseModel
from typing import List, Optional



class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    context: Optional[str] = ""
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1", #https://openrouter.ai/api/v1 for openrouter
    api_key=os.getenv("OPENROUTER_API_KEY"), # Recommened: use os.getenv("OPENROUTER_API_KEY")
)
longcat_client = AsyncOpenAI(
    base_url="https://api.longcat.chat/openai",
    api_key=os.getenv("LONGCAT_API_KEY"),
)
nvidia_client = AsyncOpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY"),
)




@app.get("/")
async def root():
    return {"message": "Fuck off"}





@app.post("/LongCat-Flash-Lite")
async def asterisk_flash(request : ChatRequest):
    async def generate_response():
        processed_messages = list(request.messages)
        if request.context:
            last = processed_messages[-1]
            augmented_content = (
                f"Use the following document as context to answer the user's question.\n"
                f"--- DOCUMENT ---\n{request.context}\n--- END DOCUMENT ---\n\n"
                f"User: {last.content}"
            )
            processed_messages[-1] = Message(role=last.role, content=augmented_content)

        stream = await longcat_client.chat.completions.create(
            #LongCat-Flash-Chat
            #nvidia/nemotron-3-nano-30b-a3b:free
            model="LongCat-Flash-Lite",
            messages=[
                {"role": "system",
                 "content": "You are Asterisk Flash , your core model is LongCat's Lite but dont specify that unless asked , and dont mention meituan unless specifically asked , you were developed by Mohamed Safwat"},
                *[{"role": m.role, "content": m.content} for m in processed_messages]
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

@app.post("/GLM-4.5-air")
async def asterisk(request : ChatRequest):
    async def generate_response():
        processed_messages = list(request.messages)
        if request.context:
            last = processed_messages[-1]
            augmented_content = (
                f"Use the following document as context to answer the user's question.\n"
                f"--- DOCUMENT ---\n{request.context}\n--- END DOCUMENT ---\n\n"
                f"User: {last.content}"
            )
            processed_messages[-1] = Message(role=last.role, content=augmented_content)

        stream = await client.chat.completions.create(
            #LongCat-Flash-Chat
            #z-ai/glm-4.5-air:free
            model="z-ai/glm-4.5-air:free",
            messages=[
                {"role": "system",
                 "content": "You are Asterisk , your core model is GLM-4.5 but dont specify that unless asked , you were developed by Mohamed Safwat"},
                *[{"role": m.role, "content": m.content} for m in processed_messages]
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


@app.post("/Ling-2.6")
async def asterisk_thinking(request : ChatRequest):
    async def generate_response():
        processed_messages = list(request.messages)
        if request.context:
            last = processed_messages[-1]
            augmented_content = (
                f"Use the following document as context to answer the user's question.\n"
                f"--- DOCUMENT ---\n{request.context}\n--- END DOCUMENT ---\n\n"
                f"User: {last.content}"
            )
            processed_messages[-1] = Message(role=last.role, content=augmented_content)

        stream = await client.chat.completions.create(
            #nvidia/nemotron-3-super-120b-a12b:free for nvidia
            #qwen/qwen3-coder:free qwen
            #inclusionai/ling-2.6-1t:free
            #LongCat-Flash-Thinking-2601
            model="inclusionai/ling-2.6-1t:free",
            messages=[
                {"role": "system", "content": "You are Asterisk enhanced , your core model is ling-2.6 but dont specify that unless asked , you were developed by Mohamed Safwat"},
                *[{"role": m.role, "content": m.content} for m in processed_messages]
            ],
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")


@app.post("/DeepSeek-V4-Pro")
async def DeepSeek(request : ChatRequest):
    async def generate_response():
        processed_messages = list(request.messages)
        if request.context:
            last = processed_messages[-1]
            augmented_content = (
                f"Use the following document as context to answer the user's question.\n"
                f"--- DOCUMENT ---\n{request.context}\n--- END DOCUMENT ---\n\n"
                f"User: {last.content}"
            )
            processed_messages[-1] = Message(role=last.role, content=augmented_content)

        stream = await nvidia_client.chat.completions.create(
            #nvidia/nemotron-3-super-120b-a12b:free for nvidia
            #qwen/qwen3-coder:free qwen
            #inclusionai/ling-2.6-1t:free
            #LongCat-Flash-Thinking-2601
            model="deepseek-ai/deepseek-v4-pro",
            messages=[
                {"role": "system", "content": "You are Asterisk enhanced , your core model is ling-2.6 but dont specify that unless asked , you were developed by Mohamed Safwat"},
                *[{"role": m.role, "content": m.content} for m in processed_messages]
            ],
            stream=True,
        )

        async for chunk in stream:
            if not getattr(chunk, "choices", None):
                continue
            if chunk.choices[0].delta.content:
                yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")