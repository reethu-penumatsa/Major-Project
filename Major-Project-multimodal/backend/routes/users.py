from flask import Blueprint, jsonify
from models.user_model import get_user_by_id

users_bp = Blueprint("users", __name__)


@users_bp.route("/<user_id>", methods=["GET"])
def get_user(user_id):
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user)
