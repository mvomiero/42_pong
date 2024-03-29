#!/bin/bash
python manage.py makemigrations
python manage.py migrate

# Check if superuser already exists
echo "from django.contrib.auth import get_user_model; User = get_user_model(); print(User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists())" | python manage.py shell | grep -q "False"

# If superuser does not exist, create it
if [ $? -eq 0 ]; then
    python manage.py createsuperuser --noinput
else
    echo "Superuser exists, skipping 'createsuperuser' command"
fi

python manage.py runserver 127.0.0.1:8000 &
nginx -g 'daemon off;' &

# Wait for Django runserver to start
while ! curl -s http://127.0.0.1:8000 >/dev/null; do
    sleep 1
done

echo ">>> SERVER UP AND RUNNING | ∘ | LET'S PLAY SOME PONG! <<<"

# Wait for the background processes to finish (django dev server and nginx shut down)
wait