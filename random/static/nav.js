// Переключение секций
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    item.classList.add('active');
    const sectionId = item.getAttribute('data-section');
    document.getElementById(sectionId).classList.add('active');

    // Если открыта "Главная" — загружаем данные
    if (sectionId === 'home') {
      loadSchedule();
      loadGrades();
    }
  });
});

// При загрузке — если "Главная" активна, загрузить данные
if (document.querySelector('.menu-item.active')?.getAttribute('data-section') === 'home') {
  setTimeout(() => {
    loadSchedule();
    loadGrades();
  }, 100);
}