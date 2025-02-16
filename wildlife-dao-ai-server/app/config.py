import os


class Config:
    DEBUG = False
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY")


class ProductionConfig(Config):
    pass
