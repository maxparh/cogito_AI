// app.js — точка входа
// Здесь можно добавить глобальные функции, если нужно
// Пока оставим пустым или с комментарием
console.log("App loaded");

if (document.querySelector('#home.active')) {
  setTimeout(() => {
    loadSchedule();
    loadGrades();
  }, 100);
}