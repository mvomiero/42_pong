from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Your additional fields here
    bio = models.TextField(blank=True)
    dashboard_color = models.CharField(max_length=20, default='')

    class Meta:
        app_label = 'users' # specifies the app label for the model

# user_permissions fields to provide customized ways of accessing these related objects for instances of CustomUser
# e.g. groups -> customuser_groups
CustomUser._meta.get_field('groups').remote_field.related_name = 'customuser_groups'
CustomUser._meta.get_field('user_permissions').remote_field.related_name = 'customuser_user_permissions'
