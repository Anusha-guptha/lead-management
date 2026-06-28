import dj_database_url
from .base import *
from decouple import config, Csv

SECRET_KEY = config("SECRET_KEY")
DEBUG = False
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="", cast=Csv())

DATABASES = {
    "default": dj_database_url.config(default=config("DATABASE_URL"))
}

CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", default="", cast=Csv())