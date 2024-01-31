#!/bin/bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser --noinput
gunicorn transcendence.wsgi:application --bind 0.0.0.0:8000 &
nginx -g 'daemon off;'