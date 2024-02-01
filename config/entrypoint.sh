#!/bin/bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser --noinput
python manage.py runserver 127.0.0.1:8000 &
nginx -g 'daemon off;'