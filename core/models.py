from django.contrib.auth.models import AbstractUser
from django.db import models
import datetime
#custom user model based on the default django user
class CustomUser(AbstractUser):
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    date_of_birth = models.DateField(default=datetime.date.today)
    email = models.EmailField(unique=True)
    weight = models.FloatField(null=True, blank=True)
    first_login_date = models.DateTimeField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female')], null=True, blank=True)
    activity_level = models.CharField(max_length=20, 
    choices=[('sedentary', 'Sedentary'), 
                ('light', 'Lightly Active'), 
                ('moderate', 'Moderately Active'), 
                ('active', 'Very Active'), 
                ('extra', 'Extra Active')], 
    null=True, blank=True)
    #string representation so user appears by username when printed
    def __str__(self):
        return self.username

#each workout session user logs goes here
class WorkoutLog(models.Model):
    #linked to user who did the workout
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='workout_logs')
    #exercise name like "bench press" or "running"
    exercise = models.CharField(max_length=255)
    #how many sets they did
    sets = models.PositiveIntegerField(default=0)
    #how many reps they achieved
    reps = models.JSONField(default=list)
    #weight achieved
    weight = models.JSONField(default=list)
    #date of exercise log
    date_logged = models.DateTimeField(auto_now_add=True)
    #type of workout (strength or cardio)
    workout_type = models.CharField(max_length=20, choices=[('strength', 'Strength'), ('cardio', 'Cardio')], default='strength')
    #any notes in workout
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.exercise} ({self.sets} sets)"

#tracks what the user ate and nutrition info
class NutritionLog(models.Model):
    #user who logged food
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='nutrition_logs')
    #food name
    food_name = models.CharField(max_length=255)
    #serving size
    serving_size = models.FloatField()
    #serving unit (grams,etc)
    serving_unit = models.CharField(max_length=50)
    #kcals ammount
    calories = models.FloatField()
    
    #macronutrients
    protein = models.FloatField()
    carbohydrates = models.FloatField()
    fat = models.FloatField()

    #date of food log
    date_logged = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.food_name} ({self.serving_size} {self.serving_unit})"

#user’s goals such as lose weight, meditate daily, etc...
class Goal(models.Model):

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    goal_type = models.CharField(max_length=10, choices=[('physical', 'Physical'), ('mental', 'Mental')], default='physical')
    
    def __str__(self):
        return f"{self.user.username} - {self.title} - {'Completed' if self.is_completed else 'In Progress'}"
    

#logs user’s mindfulness activities and overall wellness
class MindfulnessLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='mindfulness_logs')
    mood = models.IntegerField(choices=[(i, str(i)) for i in range(1, 11)])  #1-10 scale
    sleep_hours = models.FloatField()
    stress_level = models.IntegerField(choices=[(i, str(i)) for i in range(1, 11)])  # 1-10 scale
    meditation_minutes = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    date_logged = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - Mood: {self.mood}, Sleep: {self.sleep_hours}hrs"