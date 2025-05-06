# momentum/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('signup-api/', views.signup_api, name='signup-api'),
    path('login-api/', views.login_api, name='login-api'),
    path('profile-api/', views.profile_api, name='profile-api'),
    path('workout-api/', views.workout_logs_api, name='workout-api'),
    path('workout-api/<int:id>/', views.workout_log_detail_api, name='workout-log-detail'),
    path('api/search-food/', views.search_food_api, name='search-food'),
    path('api/nutrition-logs/', views.nutrition_logs_api, name='nutrition-logs'),
    path('api/nutrition-logs/<int:id>/', views.nutrition_log_detail_api, name='nutrition-log-detail'),
    path('api/nutrition-logs/<int:id>/', views.nutrition_logs_api, name='nutrition-log-detail'),
    path('update-profile-api/', views.update_profile_api, name='update-profile-api'),
    path('goals-api/', views.goals_api, name='goals-api'),
    path('goal-detail-api/<int:id>/', views.goal_detail_api, name='goal-detail-api'),
    path('api/mindfulness-logs/', views.mindfulness_logs_api, name='mindfulness-logs'),
    path('api/mindfulness-logs/<int:id>/', views.mindfulness_log_detail_api, name='mindfulness-log-detail'),
    path('update-account-api/', views.update_account_api, name='update-account-api'),


    
        
]
