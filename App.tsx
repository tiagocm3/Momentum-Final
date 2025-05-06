import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet } from 'react-native';

//screen imports
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ProfileScreen from './screens/ProfileScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import TrackingScreen from './screens/TrackingScreen';
import EducationScreen from './screens/EducationScreen';
import HelpScreen from './screens/HelpScreen';
import ExerciseGuideScreen from './screens/ExerciseGuideScreen';



//create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

//bottom tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen 
        name="Tracking" 
        component={TrackingScreen} 
        options={{
          tabBarLabel: 'Tracking'
        }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutScreen} 
        options={{
          tabBarLabel: 'Workouts'
        }}
      />
      <Tab.Screen 
        name="Education" 
        component={EducationScreen} 
        options={{
          tabBarLabel: 'Education'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
}

//auth stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen name="Education" component={EducationScreen} />
      <Stack.Screen name="HelpS" component={HelpScreen} />
      <Stack.Screen name="Exercise" component={ExerciseGuideScreen} />

    </Stack.Navigator>
  );
}
//main stack
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Exercise" component={ExerciseGuideScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen name="Education" component={EducationScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  //track auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await AsyncStorage.getItem('authToken'); //get auth token from storage
      setIsAuthenticated(!!token); //set as authenticated if token exists
    };
    checkAuthStatus(); //call function to check auth status
  }, []);
  const handleLogout = async () => {
    //clear the token
    await AsyncStorage.removeItem('authToken');
    setIsAuthenticated(false); //set authentication to false
  };
  if (isAuthenticated === null) return null; //prevents flickering when checking auth status
  
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    height: 60
  },
  tabLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins',
  }
});