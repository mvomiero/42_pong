# users/urls.py

from django.urls import path, include
from users.views import dashboard, register, profile_update

urlpatterns = [
	path('', dashboard, name='dashboard'),
	path("accounts/", include("django.contrib.auth.urls")),
    path("dashboard/", dashboard, name="dashboard"),
	path("register/", register, name="register"),
	path("profile_update/", profile_update, name="profile_update")
]
