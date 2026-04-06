# ai_research.py

import requests
import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434/api/generate")

def call_ollama_research(prompt: str, model: str = "mistral:7b") -> str:
    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": model, "prompt": prompt, "stream": False}
        )
        if response.status_code == 200:
            return response.json()["response"]
        else:
            return f"Ошибка Ollama: {response.text}"
    except Exception as e:
        return f"Не удалось подключиться к Ollama: {str(e)}"

def get_research_advice(text: str) -> str:
    prompt = f"""
Ты — эксперт по академическому письму. Дай 3–5 практических советов по улучшению текста.

Правила:
- ОТВЕЧАЙ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ.
- Отвечай ТОЛЬКО советами, каждый с новой строки.
- НЕ пиши вводные фразы: "Вот советы", "Рекомендую", "Советую", "Я считаю".
- НЕ используй маркированные списки, цифры, тире.
- НЕ оборачивай в JSON, кавычки, скобки.
- Ответ — как будто говоришь студенту в лицо.

Текст для анализа:
{text}
"""
    return call_ollama_research(prompt).strip()

def check_antigpt(text: str) -> str:
    prompt = f"""
Ты — эксперт по обнаружению генерации текста ИИ. Проанализируй текст и дай ответ строго в формате:

Вероятность генерации ИИ: X%
Анализ: [1–2 предложения — только факты, без предположений]

Правила:
- Не считай чёткость, логичность и грамотность признаком ИИ — это может быть стиль хорошего автора.
- Ищи только реальные маркеры ИИ: повторы, шаблонные фразы, "вода", отсутствие глубины, избыточное использование "важно отметить".
- Если текст структурирован, но содержит личные наблюдения, точные примеры, небольшие уточнения — это человеческий стиль.
- НЕ используй слова "возможно", "кажется", "вероятно". Только утверждения.
- Ответ — ровно 2 строки. Без лишних символов.

Текст:
{text}
"""
    return call_ollama_research(prompt).strip()