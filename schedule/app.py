import pandas as pd
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title="Schedule API")

schedule_file = "schedule.csv"
df = pd.read_csv(schedule_file)

# Заменяем NaN на None для корректного JSON
df = df.where(pd.notnull(df), None)

schedule_data = df.to_dict(orient="records")


@app.get("/schedule")
async def get_schedule():
    return JSONResponse(content=schedule_data)


@app.get("/schedule/{day}")
async def get_schedule_by_day(day: str):
    filtered = df[df['day'].str.lower() == day.lower()]
    if filtered.empty:
        return JSONResponse(content={"error": "No classes found for this day"}, status_code=404)
    return JSONResponse(content=filtered.to_dict(orient="records"))
