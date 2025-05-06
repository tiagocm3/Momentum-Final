import json
import requests
from django.conf import settings
from django.contrib.auth import authenticate
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

from .models import WorkoutLog, NutritionLog, Goal, MindfulnessLog
from .serializers import (
    CustomUserSerializer, WorkoutLogSerializer, NutritionLogSerializer,GoalSerializer, MindfulnessLogSerializer
)

#signup view
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_api(request):
    if request.method == 'POST':
        serializer = CustomUserSerializer(data=request.data) #create serializer with the incoming data
        if serializer.is_valid(): #check if the data is valid
            user = serializer.save() #save the new user
            refresh = RefreshToken.for_user(user) #make a refresh token for the user
            access_token = refresh.access_token #get the access token from the refresh

            return Response({
                'refresh': str(refresh), #send back the refresh token as a string
                'access': str(access_token), #same for access token
                'message': 'Account Created successfully!', #positive message for frontend
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) #error messaging

#login view
@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    if request.method == 'POST':
        username = request.data.get('username') #grab username from the request
        password = request.data.get('password') #grab password too

        if not username or not password: #ensure sure both fields are filled
            return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password) #attempt to log the user in

        if user is not None: #if user is found
            if not hasattr(user, 'first_login_date') or user.first_login_date is None: #check if it's their first time
                user.first_login_date = timezone.now() #set the first login time
                user.save()  #save it
                
            refresh = RefreshToken.for_user(user) #create tokens
            access_token = refresh.access_token #grab access token from refresh
            return Response({
                'refresh': str(refresh), #send back refresh token
                'access': str(access_token), #and access token
                'message': 'Login successful!', #positive message to user
                'first_login_date': user.first_login_date,  #send first login date
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST) #bad login

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def profile_api(request):
    user = request.user
    # gworkout logs
    workout_logs = WorkoutLog.objects.filter(user=user)
    workout_logs_serializer = WorkoutLogSerializer(workout_logs, many=True)
    # count nutrition logs
    nutrition_logs_count = NutritionLog.objects.filter(user=user).count()
    #count workout logs
    workout_logs_count = workout_logs.count()
    user_data = {
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'date_of_birth': user.date_of_birth,
        'weight': user.weight,
        'height': user.height,
        'age': user.age,
        'gender': user.gender,
        'activity_level': user.activity_level,
        'first_login_date': user.first_login_date,
        'workout_logs': workout_logs_serializer.data,
        'workout_logs_count': workout_logs_count,
        'nutrition_logs_count': nutrition_logs_count,
    }
    return Response(user_data, status=status.HTTP_200_OK)

#create andlist workout logs
@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def workout_logs_api(request):
    if request.method == 'GET':
        logs = WorkoutLog.objects.filter(user=request.user)
        serializer = WorkoutLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        data = request.data.copy()
        data['user'] = request.user.id  # set user id to the logged-in user
        
        serializer = WorkoutLogSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # save workout log with user association
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#delete a workout log if it belongs to the logged-in user
@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def workout_log_detail_api(request, id):
    try:
        workout_log = WorkoutLog.objects.get(id=id, user=request.user) #get the specific log for the user
    except WorkoutLog.DoesNotExist:
        return Response({'error': 'Workout log not found.'}, status=status.HTTP_404_NOT_FOUND) #log doesn't there

    workout_log.delete() #log deleted
    return Response({'message': 'Workout log deleted successfully.'}, status=status.HTTP_204_NO_CONTENT) #log delete success message

#search for food info using external api
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def search_food_api(request):
    query = request.GET.get('query', '') #grab the search query from url
    if not query:
        return Response({'error': 'Query parameter is required'}, 
                       status=status.HTTP_400_BAD_REQUEST)

    headers = {'X-Api-Key': settings.CALORIE_NINJA_API_KEY}  #auth for api
    api_url = 'https://api.calorieninjas.com/v1/nutrition' 
    
    try:
        response = requests.get(f'{api_url}?query={query}', headers=headers) #api query
        response.raise_for_status()
        data = response.json() #receive json
        
        # Add a source field to distinguish API results
        for item in data.get('items', []):
            item['source'] = 'api'
            
        return Response(data, status=status.HTTP_200_OK) #send it back to frontend
    except requests.exceptions.RequestException as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) #error message

#handles nutrition logs,fetch or create logs
@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def nutrition_logs_api(request):
    if request.method == 'GET':
        logs = NutritionLog.objects.filter(user=request.user).order_by('-date_logged') #get user's logs sorted by newest
        serializer = NutritionLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK) #return the logs
    elif request.method == 'POST':
        data = request.data.copy() #make a copy of the data
        serializer = NutritionLogSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user) #save the log for the user
            return Response(serializer.data, status=status.HTTP_201_CREATED) #succesful
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) #unsuccesful

#delete a single nutrition log if it exists and belongs to the user
@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def nutrition_log_detail_api(request, id):
    try:
        nutrition_log = NutritionLog.objects.get(id=id, user=request.user) #find log
    except NutritionLog.DoesNotExist:
        return Response({'error': 'Nutrition log not found'}, status=status.HTTP_404_NOT_FOUND) #log not dound

    nutrition_log.delete() #log deleted
    return Response({'message': 'Nutrition log deleted successfully'}, status=status.HTTP_204_NO_CONTENT) #success message

#user profile data update
@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_profile_api(request):
    user = request.user #get current user

    if 'weight' in request.data:
        user.weight = request.data['weight'] #update weight if it's in request
    if 'height' in request.data:
        user.height = request.data['height'] #same for height
    if 'age' in request.data:
        user.age = request.data['age'] #and age
    if 'gender' in request.data:
        user.gender = request.data['gender'] #update gender too
    if 'activity_level' in request.data:
        user.activity_level = request.data['activity_level'] #lastly activity level
    user.save() #save all the changes
    serializer = CustomUserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK) #send back updated profile

#goals
@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def goals_api(request):
    if request.method == 'GET':
        # get all goals for the logged-in user, sorted by newest first
        goals = Goal.objects.filter(user=request.user).order_by('-date_created')
        #try creating a new goal with the posted data
        serializer = GoalSerializer(goals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = GoalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  #link goal to user
            return Response(serializer.data, status=status.HTTP_201_CREATED) #succesful
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) #unsuccesful

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def goal_detail_api(request, id):
    try: #find the goal that belongs to the user
        goal = Goal.objects.get(id=id, user=request.user)
    except Goal.DoesNotExist:
        return Response({'error': 'Goal not found'}, status=status.HTTP_404_NOT_FOUND) #goal does not exist

    if request.method == 'GET':
        #return goal data
        serializer = GoalSerializer(goal)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        #handle full or partial update
        data = request.data.copy()
        #if user marked it complete just now, add the time
        if data.get('is_completed') and not goal.is_completed:
            data['completion_date'] = timezone.now()
        
        serializer = GoalSerializer(goal, data=data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        goal.delete()
        return Response({'message': 'Goal deleted successfully'}, status=status.HTTP_204_NO_CONTENT) #success message

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def mindfulness_logs_api(request):
    if request.method == 'GET':
        #create a new mindfulness log
        logs = MindfulnessLog.objects.filter(user=request.user).order_by('-date_logged')
        serializer = MindfulnessLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        #create a new mindfulness log
        serializer = MindfulnessLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def mindfulness_log_detail_api(request, id):
    try:
        #look for the mindfulness log belonging to the user
        mindfulness_log = MindfulnessLog.objects.get(id=id, user=request.user)
    except MindfulnessLog.DoesNotExist:
        return Response({'error': 'Mindfulness log not found'}, status=status.HTTP_404_NOT_FOUND)
   #if found, delete it
    mindfulness_log.delete()
    return Response({'message': 'Mindfulness log deleted successfully'}, status=status.HTTP_204_NO_CONTENT) #success manages
    
@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_account_api(request):
    user = request.user
    data = request.data
    response_data = {}
    try:
        #update email if provided
        if 'email' in data:
            if '@' not in data['email']:
                return Response(
                    {'error': 'Please provide a valid email address.'}, #if email doesn't exists
                    status=status.HTTP_400_BAD_REQUEST
                )
            if get_user_model().objects.filter(email=data['email']).exclude(id=user.id).exists():
                return Response(
                    {'error': 'This email is already in use.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = data['email']
            response_data['email'] = data['email']
        
        #update password if provided
        if 'new_password' in data:
            if not data.get('current_password'):
                return Response(
                    {'error': 'Current password is required to set a new password.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not user.check_password(data['current_password']):
                return Response(
                    {'error': 'Current password is incorrect.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(data['new_password'])
            response_data['password_updated'] = True
            
            #generate and return new tokens
            refresh = RefreshToken.for_user(user)
            response_data['refresh'] = str(refresh)
            response_data['access'] = str(refresh.access_token) 
        user.save()
        response_data['message'] = 'Account updated successfully'
        return Response(response_data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )