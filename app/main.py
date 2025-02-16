from flask import request, jsonify
from app.util.pipeline import full_pipeline
from app import app
from app.middleware import api_key_required


@app.route("/api/score", methods=["POST"])
@api_key_required
def get_score():
    if request.content_type != "text/plain":
        return jsonify({"error": "Content-Type must be text/plain"}), 400

    project_text = request.data.decode("utf-8")

    if not project_text:
        return jsonify({"error": "No data provided"}), 400

    return jsonify(full_pipeline(project_text))


if __name__ == "__main__":
    app.run()
