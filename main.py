from fastapi import FastAPI
from ollama import chat
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@app.get("/")
async def root():
    return {"message": "Fuck off"}


# @app.get("/Safwat-ai-flash")
# async def safwatflash_call(message: str):
#     def generate_response():
#         stream = chat(
#             model='Safwat-ai-flash',
#             messages=[
#                 {'role': 'user', 'content': message}
#             ],
#             stream=True,
#         )
#
#         for chunk in stream:
#             content = chunk['message']['content']
#             yield f"data: {json.dumps({'content': content})}\n\n"
#
#     return StreamingResponse(generate_response(), media_type="text/event-stream")

# @app.get("/Safwat-ai")
# async def safwatai_call(message: str):
#     def generate_response():
#         stream = chat(
#             model='Safwat-ai',
#             messages=[{'role': 'user', 'content': message}],
#             stream=True,
#         )
#
#         for chunk in stream:
#             content = chunk['message']['content']
#             yield f"data: {json.dumps({'content': content})}\n\n"
#
#     return StreamingResponse(generate_response(), media_type="text/event-stream")
#

# --- New POST endpoints with conversation history support ---

@app.post("/Safwat-ai-flash")
async def safwatflash_call_post(request: ChatRequest):
    def generate_response():
        # Convert pydantic models to dicts for ollama
        messages = [{'role': msg.role, 'content': msg.content} for msg in request.messages]
        stream = chat(
            model='Safwat-ai-flash',
            messages=messages,
            stream=True,
        )

        for chunk in stream:
            content = chunk['message']['content']
            yield f"data: {json.dumps({'content': content})}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")


@app.post("/Safwat-ai")
async def safwatai_call_post(request: ChatRequest):
    def generate_response():
        # Convert pydantic models to dicts for ollama
        messages = [{'role': msg.role, 'content': msg.content} for msg in request.messages]
        stream = chat(
            model='Safwat-ai',
            messages=messages,
            stream=True,
        )

        for chunk in stream:
            content = chunk['message']['content']
            yield f"data: {json.dumps({'content': content})}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")
