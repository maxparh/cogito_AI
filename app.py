from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from docx import Document
import random
import os

# Импорт клиента Ollama
from ollama import OllamaClient

app = FastAPI()
ollama_client = OllamaClient(model="llama3")  # указываем модель LLaMA 3


def convert_to_text(file_path: str) -> str:
    """
    Конвертация различных форматов в текст.
    docx -> текст
    txt -> текст
    pdf -> текст (можно через PyPDF2 или pdfplumber)
    """
    if file_path.endswith(".docx"):
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    elif file_path.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    # TODO: добавить pdf
    else:
        return ""


def split_tickets(text: str) -> list:
    """
    Разделяем текст на билеты.
    Для простоты предполагаем, что билеты разделены пустой строкой
    """
    tickets = [t.strip() for t in text.split("\n\n") if t.strip()]
    return tickets


@app.post("/upload_doc/")
async def upload_doc(file: UploadFile = File(...)):
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as f:
        f.write(await file.read())

    text = convert_to_text(temp_file)
    tickets = split_tickets(text)

    if not tickets:
        return JSONResponse({"error": "Не удалось извлечь билеты"}, status_code=400)

    selected_ticket = random.choice(tickets)

    # Сохраняем выбранный билет для проверки
    with open("current_ticket.txt", "w", encoding="utf-8") as f:
        f.write(selected_ticket)

    return {"ticket": selected_ticket}


@app.post("/submit_answer/")
async def submit_answer(answer: str = Form(...)):
    if not os.path.exists("current_ticket.txt"):
        return JSONResponse({"error": "Нет активного билета"}, status_code=400)

    with open("current_ticket.txt", "r", encoding="utf-8") as f:
        ticket = f.read()

    prompt = f"""
Ticket: {ticket}
Student Answer: {answer}

Please evaluate the answer. Provide a short score (0-10) and feedback.
"""

    response = ollama_client.chat(prompt)
    evaluation = response["content"]  # в зависимости от API Ollama

    return {"ticket": ticket, "answer": answer, "evaluation": evaluation}
