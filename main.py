import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from flask import Flask, jsonify, request, send_from_directory
from src.rules import AREAS, build_checkup

app = Flask(__name__, static_folder="static")


@app.route("/")
def home():
    return send_from_directory("static", "index.html")


@app.route("/api/areas")
def areas():
    return jsonify(AREAS)


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    return jsonify(build_checkup(data["area"], data))


if __name__ == "__main__":
    app.run(debug=True)
