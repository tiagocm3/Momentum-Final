import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MentalHealthFitnessAdvice from './MentalHealthFitnessAdvice';

//states to keep track of user status and calorie info
const HomeScreen = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [targetCalories, setTargetCalories] = useState(2000); // Default value
  const [calorieGoal, setCalorieGoal] = useState('maintain'); // Default value
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Tiago'); // Default name
  const [hideCalories, setHideCalories] = useState(false);
  const [moodRating, setMoodRating] = useState(null);
  const navigation = useNavigation();

  //ccheck auth status when the screen loads
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        console.log('About to check for authToken...');
        const token = await AsyncStorage.getItem('authToken');
        console.log('Initial auth check - raw token:', token);
        console.log('Initial auth check - token exists:', !!token);
        
        if (token) {
          console.log('Setting isAuthenticated to true');
          setIsAuthenticated(true);
          
          //grab user name if it’s saved
          const name = await AsyncStorage.getItem('userName');
          if (name) {
            setUserName(name);
          }
          
          //check if user prefers to hide calories
          const hideCaloriesPref = await AsyncStorage.getItem('hideCalories');
          if (hideCaloriesPref !== null) {
            setHideCalories(hideCaloriesPref === 'true');
          }
          
          //grab mood for today if it exists
          const todayMood = await AsyncStorage.getItem(`mood_${new Date().toISOString().split('T')[0]}`);
          if (todayMood) {
            setMoodRating(parseInt(todayMood, 10));
          }
        } else {
          console.log('No token found so navigating to login to page');
          setIsAuthenticated(false);
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigation]);

  //fetch saved calorie goal and target
  const fetchUserGoals = async () => {
    try {
      //get calorie goal type (maintain, lose, gain)
      const goalType = await AsyncStorage.getItem('calorieGoal');
      if (goalType) {
        setCalorieGoal(goalType);
      }
      const target = await AsyncStorage.getItem('targetCalories');
      if (target) {
        setTargetCalories(parseInt(target, 10));
      }
      
      console.log(`Fetched goals: ${goalType}, Target: ${target} calories`);
    } catch (error) {
      console.error('Error fetching user goals:', error);
    }
  };
  //get calories logged for today
  const fetchDailyCalories = async () => {
    if (!isAuthenticated) return;
    try {
      console.log('Fetching daily calories...');
      
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('no token found when fetching calories');
        return;
      }
  
      console.log('Token has been found:', token.substring(0, 10) + '...');
      
      //api call
      const response = await fetch('http://127.0.0.1:8000/momentum/api/nutrition-logs/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 401) {
        //if token expired
        console.log('token expired/invalid, logging out!');
        await AsyncStorage.removeItem('authToken');
        setIsAuthenticated(false); //if not authenticated
        navigation.replace('Login');
        return;
      }
  
      if (!response.ok) { //if error
        throw new Error(`HTTP error!! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const todaysLogs = data.filter(log => {
        const logDate = new Date(log.date_logged);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      });
      
      //add up the calories
      const totalCalories = todaysLogs.reduce((sum, log) => {
        return sum + (parseFloat(log.calories) || 0);
      }, 0);
      
      setDailyCalories(Math.round(totalCalories));
    } catch (error) {
      console.error('error fetching daily calories:', error);
      if (error.message.includes('401')) {
        await AsyncStorage.removeItem('authToken');
        setIsAuthenticated(false);
        navigation.replace('Login');
      }
    }
  };

  //when screen comes into view, reload 
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && !isLoading) {
        console.log('HomeScreen focused - fetching calories and goals');
        fetchUserGoals();
        fetchDailyCalories();
      }
    }, [isAuthenticated, isLoading])
  );

  //log user out
  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigation.replace('Login');
  };

  //go to the tracking screen with a tab param
  const replaceToTracking = (tab) => {
    navigation.replace('Tracking', { tab: tab });
  };

  //save calorie display preference
  const toggleCalorieDisplay = async (value) => {
    try {
      setHideCalories(value);
      await AsyncStorage.setItem('hideCalories', value.toString());
      
      if (value) {
        Alert.alert(
          "Numbers are Hidden",
          "We've hidden the specific numbers to help you focus on how you feel rather than the numbers.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('error saving calorie display preference ', error);
    }
  };

  //set how the user feels today
  const setMood = async (rating) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(`mood_${today}`, rating.toString()); //save mood rating
      setMoodRating(rating); //updates screen 
      
      Alert.alert(
        "Mood Tracked",
        "Thanks for checking in with yourself today!",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('Error saving mood rating:', error);
    }
  };

  //figure out how close user is to target
  const calculateProgress = () => {
    if (targetCalories <= 0) return 0;
    const progress = (dailyCalories / targetCalories) * 100;
    return Math.min(progress, 100); // Cap at 100%
  };

  // color for progress bar based on goal
  const getProgressColor = () => {
    const progress = calculateProgress();
    
    if (calorieGoal === 'lose') {
      //for weight loss I use a gentle green regardless of progress
      return '#66bb6a'; //light green since it is less triggering than red
    } else {
      //for maintain/gain a soft blue helps represent the calmness
      return progress > 90 ? '#42a5f5' : '#42a5f5'; //consistent color
    }
  };

  if (isLoading) { //if loading
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  //today's date in a readable format
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  //greeting based on tike of the day (morning, afternoon, evening)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}, {userName}!</Text>
          <Text style={styles.date}>{today}</Text>
          <Text style={styles.welcomeMessage}>Every step matters. Be proud of your journey.</Text>
        </View>
        
        {/*mental health fitness advice*/}
        <View style={styles.adviceContainer}>
          <MentalHealthFitnessAdvice />
        </View>
        
        {/*mood check-in*/}
        <View style={styles.moodContainer}>
          <Text style={styles.moodTitle}>How are you feeling today?</Text>
          <View style={styles.moodOptions}>
            <TouchableOpacity
              style={[styles.moodButton, moodRating === 1 && styles.moodButtonSelected]}
              onPress={() => setMood(1)}
            >
              <Text style={styles.moodEmoji}>😞</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.moodButton, moodRating === 2 && styles.moodButtonSelected]}
              onPress={() => setMood(2)}
            >
              <Text style={styles.moodEmoji}>😐</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.moodButton, moodRating === 3 && styles.moodButtonSelected]}
              onPress={() => setMood(3)}
            >
              <Text style={styles.moodEmoji}>🙂</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.moodButton, moodRating === 4 && styles.moodButtonSelected]}
              onPress={() => setMood(4)}
            >
              <Text style={styles.moodEmoji}>😊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.moodButton, moodRating === 5 && styles.moodButtonSelected]}
              onPress={() => setMood(5)}
            >
              <Text style={styles.moodEmoji}>😄</Text>
            </TouchableOpacity>
          </View>
          {/*if mood is low, display comforting message*/}
          {moodRating && moodRating < 3 && (
            <Text style={styles.moodSupportText}>
              Remember to be gentle with yourself today. Consider reaching out to someone you trust.
            </Text>
          )}
        </View>
        
        {/* toggle for hiding calories*/}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Focus on feelings, not numbers</Text>
          <Switch
            trackColor={{ false: "#d1d1d1", true: "#a5d6a7" }}
            thumbColor={hideCalories ? "#4caf50" : "#f4f3f4"}
            onValueChange={toggleCalorieDisplay}
            value={hideCalories}
          />
        </View>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Today's Nourishment</Text>
            {hideCalories ? (
              <View style={styles.focusContainer}>
                <Text style={styles.focusText}>Focus on how your body feels</Text>
                <View style={styles.bodyFocusPrompts}>
                  <Text style={styles.focusPrompt}>• Energy levels?</Text>
                  <Text style={styles.focusPrompt}>• Satisfaction?</Text>
                  <Text style={styles.focusPrompt}>• Hunger cues?</Text>
                </View>
              </View>
            ) : (
              <> {/*kcals over calories*/}
                <Text style={styles.statValue}>{dailyCalories} kcal</Text>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalText}>
                    Daily energy: {dailyCalories} / {targetCalories} kcal
                    {calorieGoal === 'maintain' ? ' (Balance)' : 
                    calorieGoal === 'lose' ? ' (Mindful)' : ' (Energize)'}
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          width: `${calculateProgress()}%`,
                          backgroundColor: getProgressColor()
                        }
                      ]} 
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => replaceToTracking('nutrition')}
          >
            <Text style={styles.buttonText}>Log Nourishment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => replaceToTracking('workout')}
          >
            <Text style={styles.buttonText}>Log Movement</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.meditationButton} 
            onPress={() => Alert.alert("Mindful Moment", "Take a deep breath. Notice how you feel right now.")}
          >
            <Text style={styles.buttonText}>Quick Mindful Moment</Text>
          </TouchableOpacity>
        </View>
        
        {/*compassion reminder*/}
        <View style={styles.reminderContainer}>
          <Text style={styles.reminderText}>
            Remember: Your worth is not measured by calories, steps, or workouts. 
            Be kind to yourself today.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 10,
  },
  header: {
    paddingVertical: 15,
    backgroundColor: '#0d0dd4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  date: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Poppins',
  },
  welcomeMessage: {
    fontSize: 13,
    color: '#e1e2e6',
    fontFamily: 'Poppins',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  stats: {
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
    width: '100%',
  },
  statTitle: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Poppins',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3f51b5',
    fontFamily: 'Poppins',
    marginBottom: 3,
  },
  statSubtext: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins',
    fontStyle: 'italic',
  },
  goalInfo: {
    width: '100%',
    marginTop: 3,
  },
  goalText: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'Poppins',
    marginBottom: 3,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  actionButtons: {
    marginTop: 5,
    paddingHorizontal: 30,
  },
  actionButton: {
    backgroundColor: '#0d0dd4',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  meditationButton: {
    backgroundColor: '#9575cd', 
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins',
  },
  adviceContainer: {
    paddingHorizontal: 30,
    marginTop: 10,
    marginBottom: 5,
  },
  reminderContainer: {
    marginTop: 5,
    marginBottom: 15,
    backgroundColor: '#f1f8e9',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#8bc34a',
  },
  reminderText: {
    fontSize: 13,
    color: '#33691e',
    fontFamily: 'Poppins',
    lineHeight: 18,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins',
    flex: 1,
  },
  focusContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  focusText: {
    fontSize: 16,
    color: '#3f51b5',
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: 5,
  },
  bodyFocusPrompts: {
    marginTop: 5,
    alignItems: 'flex-start',
  },
  focusPrompt: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'Poppins',
    marginBottom: 2,
  },
  moodContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 30,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  moodTitle: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Poppins',
    marginBottom: 10,
    textAlign: 'center',
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  moodButton: {
    width: 45,
    height: 45,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  moodButtonSelected: {
    backgroundColor: '#bbdefb',
    borderWidth: 2,
    borderColor: '#3f51b5',
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodSupportText: {
    fontSize: 12,
    color: '#424242',
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  }
});

export default HomeScreen;