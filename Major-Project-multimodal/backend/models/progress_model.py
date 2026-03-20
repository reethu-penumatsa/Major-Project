from pymongo import MongoClient
from datetime import datetime

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["pcosight"]

progress_collection = db["progress"]

# Add progress entry
def add_progress(data):

    progress_entry = {
        "user_id": data.get("user_id"),
        "doctor_visit": data.get("doctor_visit"),
        "doctor_notes": data.get("doctor_notes"),
        "period_start": data.get("period_start"),
        "period_end": data.get("period_end"),
        "diet_log": data.get("diet_log"),
        "exercise_log": data.get("exercise_log"),
        "created_at": datetime.utcnow()
    }

    return progress_collection.insert_one(progress_entry)


# Get progress history
def get_progress(user_id):
    cursor = progress_collection.find(
        {"user_id": str(user_id)}
    ).sort("created_at", -1)

    data = []
    for item in cursor:
        data.append({
            "_id": str(item["_id"]),
            "doctor_visit": item.get("doctor_visit"),
            "doctor_notes": item.get("doctor_notes"),
            "period_start": item.get("period_start"),
            "period_end": item.get("period_end"),
            "diet_log": item.get("diet_log"),
            "exercise_log": item.get("exercise_log"),
            "created_at": item.get("created_at")
        })

    return data
