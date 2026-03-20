from flask import Blueprint, request, jsonify
from models.progress_model import add_progress, get_progress

progress_bp = Blueprint("progress", __name__)

@progress_bp.route("/add", methods=["POST"])
def add_progress_route():
    data = request.json
    add_progress(data)
    return jsonify({"message": "Progress added successfully"})


@progress_bp.route("/<user_id>", methods=["GET"])
def get_progress_route(user_id):
    data = get_progress(user_id)

    for d in data:
        d["_id"] = str(d["_id"])

    return jsonify(data)