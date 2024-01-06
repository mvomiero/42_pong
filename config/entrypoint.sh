#!/bin/bash

if [ -f .env ]; then
    export $(xargs < .env)
fi

echo "Username: $DJANGO_SUPERUSER_USERNAME"
echo "Password: $DJANGO_SUPERUSER_EMAIL"
echo "Password: $DJANGO_SUPERUSER_PASSWORD"

python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py createsuperuser --noinput
python3 manage.py runserver 0.0.0.0:8000