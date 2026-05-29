"""WSGI entry point – для Gunicorn / Hostinger VPS"""
from app import app

application = app  # alias для некоторых хостингов

if __name__ == '__main__':
    app.run()
