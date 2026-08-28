from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pipeline import TextToSQLPipeline


pipeline: TextToSQLPipeline = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipeline
    pipeline = TextToSQLPipeline()
    yield


app = FastAPI(title="InsightsSQL", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str
    session_id: str = "default"


class AskResponse(BaseModel):
    answer: str
    sql: str
    data: list[dict]
    confidence: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/schema")
def get_schema():
    return pipeline.get_schema()


@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    result = pipeline.ask(req.question.strip(), req.session_id)
    return result


@app.delete("/session/{session_id}")
def clear_session(session_id: str):
    pipeline.memory.clear(session_id)
    return {"cleared": session_id}
