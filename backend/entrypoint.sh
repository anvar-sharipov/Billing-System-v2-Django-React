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

echo "Starting Daphne server..."
exec daphne -b 0.0.0.0 -p 8000 backend.asgi:application