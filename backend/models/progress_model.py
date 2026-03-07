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

    return list(progress_collection.find({"user_id": user_id}))