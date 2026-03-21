from pymongo import MongoClient
from datetime import datetime
from bson.objectid import ObjectId

client = MongoClient("mongodb://localhost:27017/")
db = client["pcosight"]

users_collection = db["users"]

def create_user(name, email, password):
    user = {
        "name": name,
        "email": email,
        "password": password,
        "created_at": datetime.utcnow()
    }
    return users_collection.insert_one(user)

def find_user(email):
    return users_collection.find_one({"email": email})

def get_user_by_id(user_id):
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        return None
    user = users_collection.find_one({"_id": obj_id})
    if not user:
        return None
    # Convert fields to JSON-serializable
    return {
        "_id": str(user.get("_id")),
        "name": user.get("name"),
        "email": user.get("email"),
        "created_at": user.get("created_at").isoformat() if user.get("created_at") else None
    }