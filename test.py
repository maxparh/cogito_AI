import csv
import sqlite3

# --- Настройки ---
csv_file = 'schedule.csv'
db_file = 'schedule.db'

# --- Создание и подключение к БД ---
conn = sqlite3.connect(db_file)
cursor = conn.cursor()

# Создаем таблицу
cursor.execute('''
CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week TEXT,
    time TEXT,
    subject TEXT
)
''')
conn.commit()

# --- Чтение CSV и вставка в БД ---
with open(csv_file, encoding='utf-8') as f:
    reader = csv.DictReader(f)
    current_day = None
    for row in reader:
        # Если день пустой, используем предыдущий
        day = row['День недели'] if row['День недели'] else current_day
        current_day = day
        cursor.execute('''
            INSERT INTO schedule (day_of_week, time, subject)
            VALUES (?, ?, ?)
        ''', (day, row['Время'], row['Пара/Предмет']))
conn.commit()

# --- Ранжирование дней по загруженности ---
cursor.execute('SELECT day_of_week, COUNT(*) as num_classes FROM schedule GROUP BY day_of_week')
day_stats = cursor.fetchall()

print("Ранжирование дней по загруженности:")
for day, count in day_stats:
    if count == 1:
        load = "Незагруженный день"
    elif count == 2:
        load = "Средней загруженности день"
    elif count >= 3:
        load = "Перегруженный день"
    print(f"{day}: {count} пары — {load}")

# Закрываем соединение
conn.close()