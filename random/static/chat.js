// chat.js — НОВАЯ ЛОГИКА ДЛЯ "ПРАКТИКА"

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const getTicketBtn = document.getElementById('getTicketBtn');
const chatMessages = document.getElementById('chatMessages');
const answerInput = document.getElementById('answerInput');
const sendAnswerBtn = document.getElementById('sendAnswerBtn');

let currentTicket = null;
let currentQuestion = null;

// --- Функции чата ---
function addMessage(text, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.innerHTML = `<p>${text}</p>`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function clearChat() {
  chatMessages.innerHTML = '';
}

// --- Загрузка файла ---
uploadBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) {
    uploadStatus.textContent = 'Пожалуйста, выберите файл.';
    uploadStatus.style.color = '#e74c3c';
    return;
  }

  uploadStatus.textContent = 'Загрузка...';
  uploadStatus.style.color = '#333';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.message) {
      uploadStatus.textContent = result.message;
      uploadStatus.style.color = '#27ae60';
      getTicketBtn.style.display = 'inline-block';
      clearChat();
      addMessage('Файл успешно загружен. Нажмите "Получить билет".', 'ai');
    } else {
      uploadStatus.textContent = 'Ошибка: ' + (result.error || 'неизвестная');
      uploadStatus.style.color = '#e74c3c';
    }
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    uploadStatus.textContent = 'Ошибка загрузки файла.';
    uploadStatus.style.color = '#e74c3c';
  }
});

// --- Получить билет ---
getTicketBtn.addEventListener('click', async () => {
  const response = await fetch('/get_ticket');
  const ticket = await response.json();

  if (ticket.error) {
    addMessage(ticket.error, 'ai');
    return;
  }

  currentTicket = ticket;
  currentQuestion = ticket.questions[0]; // Берём первый вопрос

  clearChat();
  addMessage(`Билет ${ticket.ticket_id}`, 'ai');

  ticket.questions.forEach(q => {
    addMessage(`${q.question_id}. ${q.question_text}`, 'ai');
    if (q.task) {
      addMessage(`Задание: ${q.task}`, 'ai');
    }
  });

  answerInput.disabled = false;
  answerInput.placeholder = 'Напишите ответ на вопрос...';
  answerInput.focus();
});

// --- Отправить ответ ---
sendAnswerBtn.addEventListener('click', async () => {
  const userAnswer = answerInput.value.trim();
  if (!userAnswer) {
    addMessage('Пожалуйста, напишите ответ.', 'ai');
    return;
  }

  if (!currentTicket || !currentQuestion) {
    addMessage('Сначала получите билет.', 'ai');
    return;
  }

  // Отключаем поле и меняем текст
  answerInput.disabled = true;
  answerInput.placeholder = 'Ожидание оценки...';
  sendAnswerBtn.disabled = true;

  addMessage(userAnswer, 'user');

  const response = await fetch('/submit_answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticket_id: currentTicket.ticket_id,
      question_id: currentQuestion.question_id,
      user_answer: userAnswer
    })
  });

  const result = await response.json();

  if (result.ai_feedback) {
    addMessage(result.ai_feedback, 'ai');
  } else {
    addMessage('Ошибка: не удалось получить оценку.', 'ai');
  }

  // Сброс состояния
  answerInput.value = '';
  answerInput.disabled = false;
  answerInput.placeholder = 'Напишите ответ на вопрос...';
  sendAnswerBtn.disabled = false;
});

// --- Инициализация ---
document.addEventListener('DOMContentLoaded', () => {
  getTicketBtn.style.display = 'none';
  answerInput.disabled = true;
});