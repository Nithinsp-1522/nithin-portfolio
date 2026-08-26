# Kurinji Django Admin

This branch adds a Django backend and database-backed management system without changing the existing public HTML/CSS/JS files.

## Local setup

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Open:

- Public website: `http://127.0.0.1:8000/`
- Kurinji Admin Panel: `http://127.0.0.1:8000/admin-panel/`
- Django technical admin: `http://127.0.0.1:8000/django-admin/`

## Database

SQLite is the default for local development. Production can use PostgreSQL by setting `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT`.

The first migration creates the core Kurinji data tables. The second migration seeds Owner, Administrator, Content Editor, Finance, and Viewer permission groups.

## Admin areas

- Website Content
- Gallery
- Team
- Programs
- Songs
- Payments
- Salaries
- Expenses
- Contact Messages
- Join Us Applications
- Site Settings
- Staff & Roles

The existing public site remains file-based and is served unchanged by Django so the backend can be introduced without redesigning the public pages.
