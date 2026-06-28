from .base import *
from decouple import config

SECRET_KEY = config("SECRET_KEY", default="django-insecure-dev-key-change-me")
DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("POSTGRES_DB", default="confident_group"),
        "USER": config("POSTGRES_USER", default="anusha_local"),
        "PASSWORD": config("POSTGRES_PASSWORD", default="postgres123"),
        "HOST": config("POSTGRES_HOST", default="localhost"),
        "PORT": config("POSTGRES_PORT", default="5432"),
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

