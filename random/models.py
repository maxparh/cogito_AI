from pydantic import BaseModel
from typing import List, Optional

class Question(BaseModel):
    question_id: str
    question_text: str
    task: Optional[str] = None

class Ticket(BaseModel):
    ticket_id: int
    questions: List[Question]

class SubmitAnswerRequest(BaseModel):
    ticket_id: int
    question_id: str
    user_answer: str