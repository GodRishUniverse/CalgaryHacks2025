import os
from flask import Flask
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

app.config.from_object("app.config.ProductionConfig")
app.config.update(API_KEYS=os.getenv("API_KEYS", "").split(","))

from app.main import *
