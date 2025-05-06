# Momentum - Health & Fitness App

A comprehensive health and fitness tracking application with a Django backend API and React Native iOS frontend.

## Overview

Momentum helps users track their physical fitness, nutrition, goals, and mental wellness through an intuitive mobile interface connected to a robust API. The application includes ethical considerations around mental health and provides disclaimers about not being a substitute for professional medical advice.

## Features

- User registration and authentication with JWT
- Profile management and personalization
- Workout tracking and exercise logging
- Nutrition tracking with food database integration
- Goal setting and progress monitoring
- Mindfulness and mood tracking
- Health disclaimer and ethical usage guidelines

## Project Structure

The project consists of two main components:

### Backend (Django)

- **Models**: CustomUser, WorkoutLog, NutritionLog, Goal, MindfulnessLog
- **Views**: API endpoints for all features
- **Serializers**: JSON conversion for models
- **URLs**: Routing configuration

### Frontend (React Native)

- **Authentication**: Login and signup screens
- **Home**: Dashboard and navigation
- **Tracking**: Workout, nutrition, and mindfulness logging
- **Goals**: Goal creation and tracking
- **Profile**: User settings and information

## Tech Stack

### Backend
- Django
- Django REST Framework
- djangorestframework-simplejwt
- django-cors-headers
- requests

### Frontend
- React Native
- JavaScript/TypeScript
- React Navigation
- AsyncStorage
- Various React Native community packages

## Required Dependencies

### Backend Dependencies
- django
- djangorestframework
- djangorestframework-simplejwt
- django-cors-headers
- requests

### Frontend Dependencies
- react
- react-native
- @react-native-async-storage/async-storage
- @react-native-community/datetimepicker
- @react-native-community/slider
- @react-navigation/native
- @react-navigation/stack
- react-native-gesture-handler
- react-native-reanimated
- react-native-safe-area-context
- react-native-screens
- react-native-svg
- react-native-vector-icons

### iOS Dependencies (CocoaPods)
- CocoaPods
- React-Core
- React-CoreModules
- React-RCTActionSheet
- React-RCTAnimation
- React-RCTBlob
- React-RCTImage
- React-RCTLinking
- React-RCTNetwork
- React-RCTSettings
- React-RCTText
- React-RCTVibration
- React-cxxreact
- React-jsi
- React-jsiexecutor
- React-jsinspector
- Yoga

## API Endpoints

- `/momentum/signup-api/`: User registration
- `/momentum/login-api/`: User authentication
- `/momentum/profile-api/`: User profile management
- `/momentum/workout-api/`: Workout logging and retrieval
- `/momentum/api/nutrition-logs/`: Nutrition logging
- `/momentum/api/search-food/`: Food database search
- `/momentum/goals-api/`: Goal setting and tracking
- `/momentum/api/mindfulness-logs/`: Mindfulness activity logging

## Frontend Imports

The application uses various React Native imports, including:
- React, useState, useEffect
- View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput
- Button, Alert, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Animated
- useNavigation, useRoute, NavigationProp, CommonActions
- AsyncStorage
- Slider
- DateTimePicker
- Custom components like ServingPicker

## Setup & Installation

### Backend Setup

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv env
   ```
3. Activate the virtual environment:
   - Windows: `env\Scripts\activate`
   - macOS/Linux: `source env/bin/activate`
4. Install dependencies:
   ```
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers requests
   ```
5. Run migrations:
   ```
   python manage.py migrate
   ```
6. Start the development server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory
2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```
3. Install iOS dependencies with CocoaPods:
   ```
   cd ios && pod install && cd ..
   ```
   This command installs all required native iOS dependencies specified in the Podfile.
4. Run the iOS application:
   ```
   npx react-native run-ios
   ```

## Running the App

### Starting the Backend Server

```
cd /path/to/Momentum_Final
source env/bin/activate
python manage.py runserver
```

The API will be available at http://127.0.0.1:8000/momentum/

### Running the iOS App

```
cd /path/to/Momentum_Final/MomentumApp
npx react-native run-ios
```

This will start the Metro bundler and launch the app in the iOS simulator.

### CocoaPods Information

CocoaPods is a dependency manager for Swift and Objective-C projects. For React Native iOS development, CocoaPods manages the native iOS dependencies required by the app and React Native modules.

The `pod install` command:
- Reads the Podfile in the ios directory
- Resolves dependencies between different native modules
- Installs all required iOS native dependencies
- Creates and updates the Xcode workspace file

After running `pod install`, always open the `.xcworkspace` file in Xcode rather than the `.xcodeproj` file.

## Authentication Flow

The app uses JWT for authentication:
1. User registers or logs in
2. Backend provides JWT token
3. Token is stored in AsyncStorage
4. Token is included in API requests
5. Expired tokens are refreshed automatically

## Data Models

### User
- Username, password, names
- Date of birth, weight, height
- Gender, activity level

### Workout Log
- Exercise type, sets, reps
- Weights, notes, date logged

### Nutrition Log
- Food name, serving size and unit
- Calories, macronutrients
- Date logged

### Goal
- Title, description, type
- Completion status, dates

### Mindfulness Log
- Mood rating, sleep hours
- Stress level, meditation minutes
- Notes, date logged

## Environmental Variables

The project requires an API key for the Calorie Ninja API, which should be configured in the backend's settings.py file or through environment variables.

## Database

The backend uses SQLite by default for development but can be configured for other databases in settings.py for production deployment.

## Health and Ethical Guidelines

The app includes a mandatory disclaimer about mental health topics and clarifies that it is not a substitute for professional medical advice. Users must acknowledge this disclaimer during signup.
