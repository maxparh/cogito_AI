// dashboard.js

async function loadSchedule() {
  try {
    const response = await fetch('/api/schedule/'); // Теперь этот URL будет работать
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('Данные расписания не являются массивом:', data);
      return;
    }

    // Очистка предыдущих данных
    document.getElementById('monday-schedule').innerHTML = '';
    document.getElementById('tuesday-schedule').innerHTML = '';
    document.getElementById('wednesday-schedule').innerHTML = '';
    document.getElementById('thursday-schedule').innerHTML = '';
    document.getElementById('friday-schedule').innerHTML = '';

    // Заполнение расписания по дням
    data.forEach(lesson => {
    const dayId = getDayId(lesson.day);
    if (dayId) {
        const item = document.createElement('div');
        item.className = 'schedule-item';

        // Структура: левая часть — название, правая — время + аудитория
        item.innerHTML = `
        <span class="subject">${lesson.subject}</span>
        <div class="time-room">
            <span class="time">${lesson.time}</span>
            <span class="room">${lesson.room}</span>
        </div>
        `;
        document.getElementById(dayId).appendChild(item);
    }
    });

  } catch (error) {
    console.error('Ошибка загрузки расписания:', error);
  }
}

async function loadGrades() {
  try {
    const response = await fetch('/api/grades/'); // Теперь этот URL будет работать
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('Данные оценок не являются массивом:', data);
      return;
    }

    const statsContainer = document.getElementById('attendance-grades');
    statsContainer.innerHTML = '';

    data.forEach(subject => {
      const item = document.createElement('div');
      item.className = 'stat-item';
      item.innerHTML = `
        <span>${subject.name}</span>
        <span>${subject.attendance}% | ${subject.score}/${subject.maxScore}</span>
      `;
      statsContainer.appendChild(item);
    });

    // Загрузка занятий с репетитором
    loadTutorSessions();

  } catch (error) {
    console.error('Ошибка загрузки оценок:', error);
  }
}

async function loadTutorSessions() {
  try {
    const response = await fetch('/api/tutor-sessions/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('Данные занятий с репетитором не являются массивом:', data);
      return;
    }

    const tutorContainer = document.getElementById('tutor-sessions');
    tutorContainer.innerHTML = '';

    data.forEach(session => {
      const item = document.createElement('div');
      item.className = 'tutor-item';

      // Верхняя часть: предмет + дата/время
      const topRow = document.createElement('div');
      topRow.className = 'tutor-top';
      topRow.innerHTML = `
        <span class="tutor-subject">${session.subject}</span>
        <span class="tutor-datetime">${session.datetime}</span>
      `;

      // Нижняя часть: имя + цена
      const bottomRow = document.createElement('div');
      bottomRow.className = 'tutor-bottom';
      bottomRow.innerHTML = `
        <span class="tutor-name">${session.tutor} </span>
        <span class="tutor-price">${session.price} ₽</span>
      `;

      item.appendChild(topRow);
      item.appendChild(bottomRow);
      tutorContainer.appendChild(item);
    });

  } catch (error) {
    console.error('Ошибка загрузки занятий с репетитором:', error);
  }
}

function getDayId(dayName) {
  const map = {
    'Понедельник': 'monday-schedule',
    'Вторник': 'tuesday-schedule',
    'Среда': 'wednesday-schedule',
    'Четверг': 'thursday-schedule',
    'Пятница': 'friday-schedule'
  };
  return map[dayName] || null;
}