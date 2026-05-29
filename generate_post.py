#!/usr/bin/env python3
"""
Auto-Blog Generator – Car Clean Center Rüsselsheim
===================================================
Запускать через cron ежедневно (например, в 08:00):
    0 8 * * * /path/to/venv/bin/python /path/to/generate_post.py >> /var/log/blog_gen.log 2>&1

Скрипт вызывает /api/generate-blog без темы, а сервер сам берёт свежую RSS-инспирацию
из автомобильных источников и публикует оригинальную SEO-статью.
"""

import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL   = os.getenv('BASE_URL', 'http://localhost:5000')
ADMIN_SECRET = os.getenv('ADMIN_SECRET', '')

def generate():
    if not ADMIN_SECRET:
        print("ERROR: ADMIN_SECRET not set in .env")
        sys.exit(1)

    url = f"{BASE_URL}/api/generate-blog"
    headers = {'X-Admin-Secret': ADMIN_SECRET, 'Content-Type': 'application/json'}

    try:
        resp = requests.post(url, headers=headers, json={}, timeout=120)
        data = resp.json()
        if data.get('success'):
            print(f"✅ Artikel generiert: '{data['title']}' → /blog/{data['slug']}/")
        else:
            print(f"❌ Fehler: {data.get('error', 'Unknown error')}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Anfrage fehlgeschlagen: {e}")
        sys.exit(1)

if __name__ == '__main__':
    generate()
