import os
from flask import Flask
from dotenv import load_dotenv
from app.util.setup import setup_vector_chroma_database

load_dotenv()
setup_vector_chroma_database()
app = Flask(__name__)

app.config.from_object("app.config.ProductionConfig")
app.config.update(API_KEYS=os.getenv("API_KEYS", "").split(","))

from app.main import *
