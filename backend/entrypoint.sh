#!/bin/sh
set -e

echo "Waiting for postgres..."
until python -c "import socket; socket.create_connection(('$POSTGRES_HOST', $POSTGRES_PORT), timeout=1)" 2>/dev/null; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL started"

echo "Waiting for redis..."
until python -c "import socket; socket.create_connection(('$REDIS_HOST', $REDIS_PORT), timeout=1)" 2>/dev/null; do
  echo "Redis is unavailable - sleeping"
  sleep 1
done
echo "Redis started"

echo "Running migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Initializing admin and groups..."
python manage.py initadmin

echo "Starting Daphne server..."
exec daphne -b 0.0.0.0 -p 8000 backend.asgi:application
```

### 3. Структура директорий
```
backend/
├── core/
│   ├── management/
│   │   ├── __init__.py
│   │   └── commands/
│   │       ├── __init__.py
│   │       └── initadmin.py  # <- новый файл
│   └── ...
├── entrypoint.sh
└── ...