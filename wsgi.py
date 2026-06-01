"""WSGI entry point – для Gunicorn / Hostinger VPS"""
from app import app, init_db

init_db()

application = app  # alias для некоторых хостингов

if __name__ == '__main__':
    app.run()
