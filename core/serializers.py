from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import WorkoutLog, NutritionLog, Goal, MindfulnessLog 

class WorkoutLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutLog
        fields = ['id', 'exercise', 'sets', 'reps', 'weight', 'date_logged', 'workout_type', 'notes']

class NutritionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionLog
        fields = ['id', 'food_name', 'serving_size', 'serving_unit', 'calories',
                 'protein', 'carbohydrates', 'fat', 'date_logged']

class MindfulnessLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MindfulnessLog
        fields = ['id', 'mood', 'sleep_hours', 'stress_level', 'meditation_minutes', 'notes', 'date_logged']

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    workout_logs = WorkoutLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = get_user_model()
        fields = ['username', 'first_name', 'last_name', 'email', 'date_of_birth',
                 'password', 'workout_logs', 'weight', 'height', 'age', 'gender',
                 'activity_level', 'first_login_date']
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate_email(self, value):
        if '@' not in value:
            raise ValidationError("Please provide a valid email address.")
        return value
    
    def create(self, validated_data):
        user = get_user_model().objects.create_user(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            date_of_birth=validated_data['date_of_birth'],
            password=validated_data['password']
        )
        return user

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['id', 'title', 'description', 'is_completed', 'date_created', 'completion_date', 'goal_type']
        read_only_fields = ['id', 'date_created', 'completion_date']