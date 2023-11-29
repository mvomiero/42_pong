# users/forms.py

from django.contrib.auth.forms import UserCreationForm
from django import forms
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('username', 'email', 'password1', 'password2')  # Add other fields as needed

        
class CustomUserForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['bio', 'dashboard_color']  # Add other fields as needed