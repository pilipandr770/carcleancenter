# 🚗 Car Clean Center Rüsselsheim – Website

Профессиональный Flask-сайт для автомойки с автоблогом, полным SEO и AI-оптимизацией.

---

## 📁 Структура проекта

```
carcleancenter/
├── app.py                  # Основное Flask-приложение
├── wsgi.py                 # WSGI точка входа для Gunicorn
├── generate_post.py        # Скрипт для запуска из cron
├── requirements.txt
├── .env.example            # → скопировать в .env и заполнить
├── blog.db                 # SQLite БД (создаётся автоматически)
├── templates/
│   ├── base.html           # Базовый шаблон (SEO, Schema.org, навигация)
│   ├── index.html          # Главная страница
│   ├── leistungen.html     # Услуги
│   ├── preisliste.html     # Прайс-лист
│   ├── galerie.html        # Галерея
│   ├── blog.html           # Список статей
│   ├── blog_post.html      # Страница статьи
│   ├── faq.html            # FAQ
│   └── kontakt.html        # Контакты
└── static/
    ├── css/style.css       # Темная luxury тема
    └── js/main.js          # Анимации, FAQ, мобильное меню
```

---

## 🚀 Запуск на Hostinger VPS / Hetzner

### 1. Установка зависимостей

```bash
git clone ... && cd carcleancenter
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Настройка .env

```bash
cp .env.example .env
nano .env  # заполнить все переменные
```

### 3. Инициализация БД и тест

```bash
python app.py  # тест на localhost:5000
```

Если используете Postgres (Render), инициализацию/миграцию можно выполнить отдельно:

```bash
python -c "from app import init_db; init_db()"
```

### 4. Systemd-сервис (production)

```ini
# /etc/systemd/system/carcleancenter.service
[Unit]
Description=Car Clean Center Flask App
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/carcleancenter
Environment="PATH=/var/www/carcleancenter/venv/bin"
ExecStart=/var/www/carcleancenter/venv/bin/gunicorn \
    --workers 3 \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable carcleancenter
sudo systemctl start carcleancenter
```

### 5. Nginx конфигурация

```nginx
server {
    listen 80;
    server_name carcleancenter.net www.carcleancenter.net;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/carcleancenter/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6. SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d carcleancenter.net -d www.carcleancenter.net
```

## Deploy на Render + Postgres schema

### Environment Variables (Render)

- `SECRET_KEY`
- `ADMIN_SECRET`
- `ANTHROPIC_API_KEY`
- `BASE_URL` (например `https://carcleancenter.onrender.com` или ваш домен)
- `DATABASE_URL` (External Database URL из Render)
- `DB_SCHEMA` (например `carcleancenter`)

Примечание: при наличии `DATABASE_URL` приложение автоматически переключается на Postgres.

### Build / Start / Release команды

- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn --workers 2 --timeout 180 wsgi:application`
- Release Command (рекомендуется): `python -c "from app import init_db; init_db()"`

Release-команда безопасна для повторного запуска: она создаёт schema, таблицу и добавляет недостающие колонки.

---

## 📝 Автогенерация блога

Сейчас генерация работает в ежедневном режиме: сервис сначала пытается взять свежую тему из RSS-источников по авто,
а затем просит Claude Haiku написать оригинальную SEO-статью на основе саммари. Если в RSS нет новых подходящих тем,
он падает обратно на локальный список тем автопфолги.

Подключенные входные RSS-источники:
- Motor1 Deutschland: https://de.motor1.com/rss/articles/all/
- auto motor und sport: https://www.auto-motor-und-sport.de/rss/alle
- Coat'n Cast München: https://www.coatncast.de/feed

Своя RSS-лента блога доступна по адресу `/rss.xml`.

### Разовый запуск

```bash
curl -X POST https://carcleancenter.net/api/generate-blog \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Конкретная тема

```bash
curl -X POST https://carcleancenter.net/api/generate-blog \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"topic": "Keramikversiegelung Rüsselsheim – Lohnt es sich?"}'
```

### Cron (раз в неделю)

```bash
# crontab -e
0 8 * * 1 cd /var/www/carcleancenter && venv/bin/python generate_post.py >> /var/log/blog_gen.log 2>&1
```

---

## 🔍 SEO-файлы (автоматически)

| URL | Описание |
|-----|----------|
| `/robots.txt` | Разрешения для всех ботов, ссылка на sitemap |
| `/sitemap.xml` | Все страницы + все статьи блога |
| `/llms.txt` | Для AI-чатботов (ChatGPT, Perplexity, Gemini) |
| `/ai.txt` | Политика для AI-краулеров |
| `/humans.txt` | Стандартный файл |
| `/manifest.json` | PWA манифест |

---

## 🏆 SEO-стратегия

### Целевые ключевые слова

| Ключевое слово | Тип |
|---|---|
| Autopflege Rüsselsheim | Локальный главный |
| Fahrzeugaufbereitung Rüsselsheim | Локальный |
| Handwäsche Auto Rüsselsheim | Локальный |
| Keramikversiegelung Rüsselsheim | Локальный конкурентный |
| Politur Auto Rüsselsheim | Локальный |
| Autopflege Frankfurt | Региональный |
| Car Detailing Hessen | Региональный |

### Google Business Profile (ВАЖНО!)
1. Зарегистрировать/верифицировать Google Business Profile
2. Добавить все услуги и фотографии
3. Просить клиентов оставлять отзывы
4. Публиковать посты (связать с блогом)

### Ссылки для подачи в индекс
- Google Search Console: добавить сайт, подать sitemap.xml
- Bing Webmaster Tools: то же самое
- Google My Business: синхронизировать

### AI-видимость (llms.txt / ai.txt)
Файлы уже оптимизированы для:
- ChatGPT (GPTBot)
- Google Gemini
- Perplexity
- Anthropic Claude (ClaudeBot)

---

## 💡 Рекомендации клиенту

1. **Google Business Profile** — самое важное для локального SEO, бесплатно
2. **Отзывы Google** — просить каждого довольного клиента
3. **Блог** — запускать автогенерацию раз в неделю через cron
4. **Фотографии** — загружать новые работы в галерею регулярно
5. **WhatsApp** — уже интегрирован, отличный конверсионный инструмент

---

## 🛠️ Технологии

- **Backend:** Python 3.11+, Flask 3.1, SQLite/PostgreSQL
- **Frontend:** HTML5, CSS3 (кастомный dark luxury дизайн), Vanilla JS
- **AI Blog:** Anthropic Claude API (claude-opus-4-5)
- **SEO:** Schema.org JSON-LD, Open Graph, robots.txt, sitemap.xml, llms.txt
- **Deploy:** Gunicorn + Nginx + systemd

---

*Разработано для Car Clean Center Rüsselsheim, 2025*
