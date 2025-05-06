# momentum/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model
CustomUser = get_user_model()

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField()
    first_name = forms.CharField(max_length=150)
    last_name = forms.CharField(max_length=150)
    date_of_birth = forms.DateField(widget=forms.SelectDateWidget(years=range(1900, 2024)))

    class Meta:
        model = CustomUser
        fields = ('username', 'first_name', 'last_name', 'email', 'date_of_birth', 'password1', 'password2')
