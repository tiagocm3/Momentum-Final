# momentum/admin.py
#tiago
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, WorkoutLog
from .forms import CustomUserCreationForm

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm  # Use custom form for user creation
    form = CustomUserCreationForm  # Use custom form for user editing
    model = CustomUser
    list_display = ('username', 'email', 'first_name', 'last_name', 'date_of_birth', 'is_active', 'is_staff',)
    list_filter = ('is_staff', 'is_active',)
    search_fields = ('username', 'email',)
    ordering = ('username',)

# Register the CustomUserAdmin
admin.site.register(CustomUser, CustomUserAdmin)

class WorkoutLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'exercise', 'sets', 'date_logged')
    list_filter = ('exercise', 'date_logged')
    search_fields = ('user__username', 'exercise')
    ordering = ('-date_logged',)

admin.site.register(WorkoutLog, WorkoutLogAdmin)