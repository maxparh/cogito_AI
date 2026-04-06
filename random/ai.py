import requests
import json
import os
import re

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434/api/generate")

def call_ollama(prompt: str, model: str = "mistral:7b") -> str:
    """Вызывает Ollama и возвращает ответ"""
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "prompt": prompt,
                "stream": False
            }
        )
        if response.status_code == 200:
            return response.json()["response"]
        else:
            return f"Ошибка Ollama: {response.text}"
    except Exception as e:
        return f"Не удалось подключиться к Ollama: {str(e)}"

def extract_tickets_from_text(text: str) -> list:
    prompt = f"""
    Преобразуй следующий текст в структурированный формат билетов.
    Каждый билет начинается с "N Билет", вопросы — с "N.M Вопрос".
    Если есть "Задание", добавь его как поле "task" к последнему вопросу.

    Требования:
    - Верни ТОЛЬКО валидный JSON-массив. НИКАКИХ пояснений, комментариев, маркированных списков, слов "вот", "вот ваш" и т.п.
    - Используй только двойные кавычки.
    - Не добавляй ничего до или после массива.
    - Массив должен быть ровно один: []

    Пример:
    [
      {{
        "ticket_id": 1,
        "questions": [
          {{
            "question_id": "1.1",
            "question_text": "Что такое FastAPI?",
            "task": "Объясните своими словами."
          }}
        ]
      }}
    ]

    Текст:
    {text}
    """

    result = call_ollama(prompt)

    # Пытаемся найти JSON-массив между [ и ]
    match = re.search(r'\[\s*{.*}\s*\]', result, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # Если не нашли — попробуем весь текст как JSON
    try:
        return json.loads(result.strip())
    except json.JSONDecodeError:
        pass

    # Если ничего не сработало — возвращаем ошибку
    return [{"ticket_id": 1, "questions": [], "error": "Не удалось распарсить ответ ИИ"}]