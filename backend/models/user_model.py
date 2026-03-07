from pymongo import MongoClient
from datetime import datetime

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