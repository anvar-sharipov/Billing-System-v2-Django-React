#!/bin/sh
set -e

echo "Waiting for postgres..."
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL started"

echo "Waiting for redis..."
while ! nc -z $REDIS_HOST $REDIS_PORT; do
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

echo "Starting Gunicorn server..."
exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --threads 2 \
    --timeout 3600 \
    --graceful-timeout 3600 \
    --limit-request-line 0 \
    --limit-request-field_size 0 \
    --access-logfile - \
    --error-logfile - \
    --log-level info