#!/bin/bash

if [ -f .env ]; then
    export $(xargs < .env)
fi

echo "Username: $DJANGO_SUPERUSER_USERNAME"
echo "Password: $DJANGO_SUPERUSER_EMAIL"
echo "Password: $DJANGO_SUPERUSER_PASSWORD"

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser --noinput
python manage.py runserver 0.0.0.0:8000