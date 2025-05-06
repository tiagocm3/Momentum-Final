import React, { useState, useEffect } from 'react';
import Slider from '@react-native-community/slider';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Button, Alert,ActivityIndicator} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ServingPicker from './ServingPicker';
import { getToken } from './authUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TrackingScreen = () => {
    //workout state for both strength and cardio (fields are shared)
    const [workout, setWorkout] = useState({ exercise: '', sets: 0, duration: '',distance: '', notes: ''});
    //toggle between strength and cardio tabs
    const [workoutType, setWorkoutType] = useState('strength'); // 'strength' or 'cardio'
    //list of recent workouts for display
    const [recentWorkouts, setRecentWorkouts] = useState([]);
    //state for current sets (used in strength workouts)
    const [currentSets, setCurrentSets] = useState([]);
    //search input for food/nutrition stuff
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    //list of recently logged nutrition items
    const [recentNutrition, setRecentNutrition] = useState([]);
    //state for servings dropdown
    const [selectedServing, setSelectedServing] = useState('1');
    //tracks which box (meal) user is adding to (breakfast/lunch/dinner)
    const [selectedMealBox, setSelectedMealBox] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);
    //suggestions from search API
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    //manual mode for food entry (instead of search)
    const [isManualMode, setIsManualMode] = useState(false);
    //manual food entry fields
    const [manualEntry, setManualEntry] = useState({food_name: '', serving_size: '',serving_unit: 'g',calories: '',protein: '',carbohydrates: '',fat: ''});
    //which tab is active: workout/nutrition/mindfulness
    const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'mindfulness'>('workout');
    //mindfulness form state
    const [mindfulness, setMindfulness] = useState({mood: '5', sleepHours: '7',stressLevel: '5',meditationMinutes: '',notes: ''});
    //recently logged mindfulness entries
    const [recentMindfulness, setRecentMindfulness] = useState([]);
    //navigation hooks
    const navigation = useNavigation();
    const route = useRoute();



//runs once on mount: checks if auth token is valid
useEffect(() => {
  const checkAuth = async () => {
    try {
      console.log("checking authentication status ");
      
      //grab token from local storage
      const directToken = await AsyncStorage.getItem('authToken');
      console.log("rirect token exists ", !!directToken);
      if (directToken) {
        console.log("token preview ", directToken.substring(0, 15) + "...");
        
        //try hitting profile endpoint to validate token
        console.log("Testing token with a profile API request...");
        const response = await fetch('http://127.0.0.1:8000/momentum/profile-api/', {
          headers: {
            'Authorization': `Bearer ${directToken}`,
            'Content-Type': 'application/json',
          },
        });
        console.log("auth test response status ", response.status);
        
        if (response.status === 401) {
          ///token is expired or not valid
          console.error("authentication failed, clearing the token");
          await AsyncStorage.removeItem('authToken');
          Alert.alert(
            "Session has expired!!", 
            "your session has expired so please log in again.",
            [{ text: "OK", onPress: () => navigation.navigate('Login') }]
          );
        }
      } else {
        //no token at all
        console.log("No token found!");
        Alert.alert(
          "authentication required", 
          "please log in to continue ",
          [{ text: "OK", onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error) {
      console.error("auth check error!", error);
    }
  };
  
  checkAuth();
}, []);
  //when user switches tabs, fetch that tabs data
  useEffect(() => {
    if (activeTab === 'workout') {
      fetchWorkouts();
    } else if (activeTab === 'nutrition') {
      fetchNutritionLogs();
    } else if (activeTab === 'mindfulness') {
      fetchMindfulnessLogs();
    }
  }, [activeTab]);

  //fetches workouts from the backend
  const fetchWorkouts = async () => {
    try {
      console.log("Fetching workouts...");
      
      const token = await getToken();
      if (!token) {
        console.log("no token found in the fetchWorkouts");
        return;
      }
      
      // Debug token
      console.log("Token first 20 chars:", token.substring(0, 20) + "...");
      
      const response = await fetch('http://127.0.0.1:8000/momentum/workout-api/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        //debug logging if something goes wrong
        console.error("response status ", response.status);
        console.error("response statusText ", response.statusText);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`failed to fetch workouts  ${response.status} ${errorText}`);
      }
  
      const data = await response.json();
      const formattedWorkouts = data.map(workout => {
        //check if its a cardio workout
        const isCardio = workout.workout_type === 'cardio' || 
                       (workout.sets === 1 && workout.reps.length === 1 && 
                        !isNaN(Number(workout.reps[0])) && Number(workout.reps[0]) > 30);
        
        if (isCardio) {
        //map cardio workout to frontend format
          return {
            id: workout.id,
            exercise: workout.exercise,
            workout_type: 'cardio',
            duration: workout.reps[0] || '',
            distance: workout.weight[0] || '',
            notes: workout.notes || '',
            date_logged: workout.date_logged
          };
        } else {
        //map strength workout to frontend format
          return {
            id: workout.id,
            exercise: workout.exercise,
            workout_type: 'strength',
            sets: workout.reps.map((rep, index) => ({
              set: index + 1,
              reps: rep,
              weight: workout.weight[index]
            })),
            date_logged: workout.date_logged
          };
        }
      });
  
      setRecentWorkouts(formattedWorkouts);
    } catch (error) {
      console.error('error fetching workouts ', error);
      Alert.alert('error', 'failed to fetch workouts!');
    }
  };
  //updates workout form values as user types
  const handleWorkoutChange = (field, value) => {
    if (field === 'sets') {
      const numericValue = parseInt(value, 10);
      setWorkout(prev => ({ ...prev, sets: isNaN(numericValue) ? 0 : numericValue }));
    } else {
      setWorkout(prev => ({ ...prev, [field]: value }));
    }
  };
  //handles saving either strength or cardio workout
  const handleSaveWorkout = async () => {
    if (!workout.exercise) {
      Alert.alert("Error", "Please enter the exercise name.");
      return;
    }
  
    let newWorkout;
    
    if (workoutType === 'strength') {
      if (workout.sets <= 0) {
        Alert.alert("Error", "Please enter the number of sets.");
        return;
      }

      //collect reps + weights from UI
      const repsArray = currentSets.map(set => set.reps);
      const weightsArray = currentSets.map(set => set.weight);
  
      newWorkout = {
        exercise: workout.exercise,
        sets: workout.sets,
        reps: repsArray,
        weight: weightsArray,
        date_logged: new Date().toISOString(),
        workout_type: 'strength'
      };
    } else {
      //handle cardio form
      if (!workout.duration && !workout.distance) {
        Alert.alert("Error", "Please enter either duration or distance for your cardio workout.");
        return;
      }
  
      newWorkout = {
        exercise: workout.exercise,
        sets: 1,
        reps: workout.duration ? [workout.duration] : [""],
        weight: workout.distance ? [workout.distance] : [""],
        date_logged: new Date().toISOString(),
        workout_type: 'cardio',
        notes: workout.notes || ""
      };
    }
  
    try {
      //debug log to check for authentication
      console.log("attempting to save workout with token...");
      
      const token = await getToken();
      if (!token) {
        console.log("no token found in getToken()");
        Alert.alert("error", "You must be logged in order to save a workout.");
        return;
      }
      
      //debug token
      console.log("Token first 20 chars:", token.substring(0, 20) + "...");
  
      const response = await fetch('http://127.0.0.1:8000/momentum/workout-api/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newWorkout),
      });
  
      if (!response.ok) {
        console.error("response status ", response.status);
        console.error("response statusText ", response.statusText);
        const errorText = await response.text();
        console.error("rrror response ", errorText);
        throw new Error(`failed to save the workout  ${response.status} ${errorText}`);
      }
  
      await response.json();
      //clear form after saving
      if (workoutType === 'strength') {
        setWorkout({ exercise: '', sets: 0 });
        setCurrentSets([]);
      } else {
        setWorkout({ exercise: '', duration: '', distance: '', notes: '' });
      }
      //reload workouts
      fetchWorkouts();
      Alert.alert("Success!!", `${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} workout saved!`);
    } catch (error) {
      console.error("error saving the workout:", error);
      Alert.alert("error", "failed to save workout.");
    }
  };
  //handles deleting a workout by id
  const handleDeleteWorkout = async (id) => {
    try {
      const token = await getToken();  //grab the token first
      if (!token) {
        Alert.alert("error", "you must be logged in to delete a workout.");
        return;
      }

      //send delete request to backend
      const response = await fetch(`http://127.0.0.1:8000/momentum/workout-api/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, //auth header
        },
      });

      //check if delete worked
      if (response.status === 204) {
        Alert.alert("success ", "workout deleted successfully!"); //delete worked
        fetchWorkouts(); //refresh the workouts list
      } else {
        throw new Error('Failed to delete workout');
      }
    } catch (error) {
      console.error("error deleting workout:", error); //log error
      Alert.alert("error", "failed to delete workout."); //inform user of error
    }
  };

  //renders the workout section UI
  const renderWorkoutSection = () => (
    <>
      <View style={styles.workoutTypeContainer}>
        <Text style={styles.sectionHeader}>Workout Type</Text>
        <View style={styles.workoutTypeButtons}>
          <TouchableOpacity
            style={[
              styles.workoutTypeButton,
              workoutType === 'strength' ? styles.selectedWorkoutType : null
            ]}
            onPress={() => setWorkoutType('strength')}
          >
            <Text style={[
              styles.workoutTypeText,
              workoutType === 'strength' ? styles.selectedWorkoutTypeText : null
            ]}>
              Strength
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.workoutTypeButton,
              workoutType === 'cardio' ? styles.selectedWorkoutType : null
            ]}
            onPress={() => setWorkoutType('cardio')}
          >
            <Text style={[
              styles.workoutTypeText,
              workoutType === 'cardio' ? styles.selectedWorkoutTypeText : null
            ]}>
              Cardio
            </Text>
          </TouchableOpacity>
        </View>
      </View>
  
      <TextInput
        style={styles.input}
        placeholder="Exercise"
        value={workout.exercise}
        onChangeText={(text) => handleWorkoutChange('exercise', text)}
      />
      
      {workoutType === 'strength' ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Number of Sets"
            keyboardType="numeric"
            value={String(workout.sets)}
            onChangeText={(text) => handleWorkoutChange('sets', text)}
          />
          <Button title="Add Set Details" onPress={handleAddSetDetails} />
          {renderSetInputs()}
        </>
      ) : (
        <>
          <View style={styles.cardioInputContainer}>
            <TextInput
              style={[styles.input, styles.cardioInput]}
              placeholder="Duration (minutes)"
              keyboardType="numeric"
              value={workout.duration || ''}
              onChangeText={(text) => handleWorkoutChange('duration', text)}
            />
            <TextInput
              style={[styles.input, styles.cardioInput]}
              placeholder="Distance (km)"
              keyboardType="numeric"
              value={workout.distance || ''}
              onChangeText={(text) => handleWorkoutChange('distance', text)}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Notes (optional)"
            multiline={true}
            numberOfLines={2}
            value={workout.notes || ''}
            onChangeText={(text) => handleWorkoutChange('notes', text)}
          />
        </>
      )}
      
      <Button 
        title="Save Workout" 
        onPress={handleSaveWorkout}  //submit workout
      />
    </>
  );

  //handles food search input change
  const handleSearchInputChange = async (text) => {
    setSearchQuery(text); //update state
    if (text.length >= 2) {
      try {
        const token = await getToken(); //auth again
        const response = await fetch(
          `http://127.0.0.1:8000/momentum/api/search-food/?query=${encodeURIComponent(text)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('search failed!');
        const data = await response.json(); //get results
        setSearchSuggestions(data.items || []); //update suggestions
      } catch (error) {
        console.error('error getting suggestions:', error); //log error
      }
    } else {
      setSearchSuggestions([]); //clear if text too short
    }
  };

  //handles manual food entry submission
  const handleManualEntrySubmit = async () => {
    try {
      const token = await getToken(); //grab token
      const response = await fetch('http://127.0.0.1:8000/momentum/api/nutrition-logs/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(manualEntry), //send form data
      });

      if (!response.ok) throw new Error('failed to save manual entry'); //fail check
      
      Alert.alert('Success', 'Food logged successfully'); //nutrition logged correclty
      setManualEntry({ food_name: '',serving_size: '',serving_unit: 'g',calories: '',protein: '',carbohydrates: '',fat: ''
      });
      setIsManualMode(false); //close manual input
      fetchNutritionLogs(); //refresh list
    } catch (error) {
      console.error('Error saving manual entry:', error); //log error
      Alert.alert('error', 'failed to save food entry'); //inform user of error
    }
  };
  //gets recent mindfulness logs
  const fetchMindfulnessLogs = async () => {
    try {
      const token = await getToken(); //token again
      if (!token) {
        console.log("No token found"); //not logged in
        return;
      }
  
      const response = await fetch('http://127.0.0.1:8000/momentum/api/mindfulness-logs/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Failed to fetch mindfulness logs'); //check failed
  
      const data = await response.json(); //parse response
      setRecentMindfulness(data); //update state
    } catch (error) {
      console.error('error fetching mindfulness logs ', error); //log it
      Alert.alert('error', 'failed to fetch mindfulness logs!!'); //alert user
    }
  };
  
  //updates mindfulness form field
  const handleMindfulnessChange = (field, value) => {
    setMindfulness(prev => ({ ...prev, [field]: value })); //merge update
  };
  
  //saves a mindfulness log
  const handleSaveMindfulness = async () => {
    try {
      const token = await getToken(); //get token
      if (!token) {
        Alert.alert("error", "you must be logged in to save the mindfulness data."); //inform user of logged in status
        return;
      }
      
      //prepare data for post
      const mindfulnessData = {
        mood: parseInt(mindfulness.mood, 10),
        sleep_hours: parseFloat(mindfulness.sleepHours),
        stress_level: parseInt(mindfulness.stressLevel, 10),
        meditation_minutes: mindfulness.meditationMinutes ? parseInt(mindfulness.meditationMinutes, 10) : null,
        notes: mindfulness.notes
      };
      //post data
      const response = await fetch('http://127.0.0.1:8000/momentum/api/mindfulness-logs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mindfulnessData),
      });
  
      if (!response.ok) throw new Error('failed to save mindfulness log!!'); //error notification
  
      await response.json(); 
      setMindfulness({ //reset form
        mood: '5',
        sleepHours: '7',
        stressLevel: '5',
        meditationMinutes: '',
        notes: ''
      });
      fetchMindfulnessLogs(); //refresh logs
      Alert.alert("success", "mindfulness data saved!");
    } catch (error) {
      console.error("error saving mindfulness data ", error);
      Alert.alert("error", "failed to save mindfulness data!!");
    }
  };
  
  const deleteMindfulnessLog = async (id) => {
    try {
      const token = await getToken(); //grab the token first
      const response = await fetch(`http://127.0.0.1:8000/momentum/api/mindfulness-logs/${id}/`, { //api url
        method: 'DELETE', //delete method
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 204) {
        Alert.alert('Success', 'Mindfulness log deleted successfully');
        fetchMindfulnessLogs(); //refresh the logs list
      } else {
        throw new Error('failed to delete mindfulness log!');
      }
    } catch (error) {
      console.error('error deleting mindfulness log ', error);
      Alert.alert('error ', 'failed to delete mindfulness log!!');
    }
  };
  const fetchNutritionLogs = async () => {
    try {
      const token = await getToken(); //get auth token
      if (!token) {
        console.log("No token found"); //if no token is found the following message is displayed (user has to log in)
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/momentum/api/nutrition-logs/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('failed to fetch nutrition logs!'); //error handling

      const data = await response.json(); //get the logs data
      setRecentNutrition(data); //store it in state
    } catch (error) {
      console.error('error fetching nutrition logs!', error); //dev error
      Alert.alert('error ', 'failed to fetch nutrition logs!!'); //user facing error
    }
  };

  const searchFood = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error ', 'Please enter a food item to search!'); //don't allow empty queries
      return;
    }
  
    setIsSearching(true);
    try {
      // this si for debugging
      const directToken = await AsyncStorage.getItem('authToken');
      console.log('Direct token access:', directToken);
      
      if (!directToken) {
        Alert.alert('Authentication Error', 'Please log in again');
        // navigate to login
        setIsSearching(false);
        return;
      }
  
      const response = await fetch(`http://127.0.0.1:8000/momentum/api/search-food/?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${directToken}`,
        },
      });
  
      if (!response.ok) {
        console.error('Search response status:', response.status); //log the status code
        throw new Error('Failed to search food');
      }
  
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('error searching food:', error);
      Alert.alert('error', 'failed to search for food'); //user alert
    } finally {
      setIsSearching(false); //remove spinner
    }
  };

  const logNutrition = async (foodItem) => {
    try {
      const servingNumber = Number(selectedServing) || 1; //default to 1 if nothing selected
      const token = await getToken(); //grab token again
      const nutritionData = {
        food_name: foodItem.name,
        serving_size: servingNumber,
        serving_unit: foodItem.serving_size_unit || 'g', //fallback unit
        calories: Math.round(foodItem.calories * servingNumber),
        protein: Math.round(foodItem.protein_g * servingNumber * 10) / 10,
        carbohydrates: Math.round(foodItem.carbohydrates_total_g * servingNumber * 10) / 10,
        fat: Math.round(foodItem.fat_total_g * servingNumber * 10) / 10,
      };
  
      const response = await fetch('http://127.0.0.1:8000/momentum/api/nutrition-logs/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nutritionData),
      });
  
      if (!response.ok) throw new Error('Failed to log nourishment!');
  
      Alert.alert('Success', 'Nourishment Logged Succesfully!'); //nourishment instead of calories 
      fetchNutritionLogs(); //refresh nutrition section
      setSearchResults([]); //clear search results
      setSearchQuery(''); //reset search input
      setSelectedServing('1'); //reset serving amount
    } catch (error) {
      console.error('error logging nutrition ', error);
      Alert.alert('error ', 'failed to log nutrition data!');
    }
  };

  const deleteNutritionLog = async (id) => {
    try {
      const token = await getToken(); //auth again
      const response = await fetch(`http://127.0.0.1:8000/momentum/api/nutrition-logs/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        Alert.alert('Success', 'Nutrition log deleted successfully');
        fetchNutritionLogs();
      } else {
        throw new Error('Failed to delete nutrition log');
      }
    } catch (error) {
      console.error('error deleting nutrition log:', error);
      Alert.alert('error', 'failed to delete nutrition log!!'); //user facing message
    }
  };

  const handleAddSetDetails = () => {
    const setDetails = [];
    for (let i = 0; i < workout.sets; i++) {
      setDetails.push({ set: i + 1, reps: '', weight: '' }); //create empty fields for reps/weight
    }
    setCurrentSets(setDetails); //update state
  };
  // the render functions



//mindfulness section
const renderMindfulnessSection = () => (
    <>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Track Your Mindfulness</Text>
        
        <Text style={styles.inputLabel}>Mood (1-10)</Text>
        <View style={styles.sliderContainer}>
          <Text>1</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={parseInt(mindfulness.mood, 10)}
            onValueChange={(value) => handleMindfulnessChange('mood', value.toString())}
            minimumTrackTintColor="#0d0dd4" //styling
            maximumTrackTintColor="#d3d3d3"
          />
          <Text>10</Text>
          <Text style={styles.sliderValue}>{mindfulness.mood}</Text>
        </View>
        
        <Text style={styles.inputLabel}>Sleep Hours</Text>
        <TextInput
          style={styles.input}
          placeholder="Hours of sleep"
          keyboardType="decimal-pad"
          value={mindfulness.sleepHours}
          onChangeText={(text) => handleMindfulnessChange('sleepHours', text)}
        />
        
        <Text style={styles.inputLabel}>Stress Level (1-10)</Text>
        <View style={styles.sliderContainer}>
          <Text>1</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={parseInt(mindfulness.stressLevel, 10)}
            onValueChange={(value) => handleMindfulnessChange('stressLevel', value.toString())}
            minimumTrackTintColor="#0d0dd4"
            maximumTrackTintColor="#d3d3d3"
          />
          <Text>10</Text>
          <Text style={styles.sliderValue}>{mindfulness.stressLevel}</Text>
        </View>
        
        <Text style={styles.inputLabel}>Meditation (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="Minutes (optional)"
          keyboardType="numeric"
          value={mindfulness.meditationMinutes}
          onChangeText={(text) => handleMindfulnessChange('meditationMinutes', text)}
        />
        
        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="How are you feeling today? (optional)"
          multiline={true}
          numberOfLines={4}
          value={mindfulness.notes}
          onChangeText={(text) => handleMindfulnessChange('notes', text)}
        />
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveMindfulness}>
          <Text style={styles.saveButtonText}>Log Mindfulness</Text>
        </TouchableOpacity>
      </View>
    </>
  );
  //render mindfulness logs
  const renderMindfulnessLogs = () => {
    return recentMindfulness.map((log, index) => (
      <View key={index} style={styles.logContainer}>
        <Text style={styles.logHeader}>
          {new Date(log.date_logged).toLocaleDateString()} - {new Date(log.date_logged).toLocaleTimeString()}
        </Text>
        <View style={styles.mindfulnessStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Mood:</Text>
            <Text style={styles.statValue}>{log.mood}/10</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Sleep:</Text>
            <Text style={styles.statValue}>{log.sleep_hours} hrs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Stress:</Text>
            <Text style={styles.statValue}>{log.stress_level}/10</Text>
          </View>
        </View>
        {log.meditation_minutes && (
          <Text style={styles.logText}>Meditation: {log.meditation_minutes} minutes</Text>
        )}
        {log.notes && (
          <Text style={styles.logText}>Notes: {log.notes}</Text>
        )}
        <Button
          title="Delete"
          onPress={() => deleteMindfulnessLog(log.id)}
          color="red"
        />
      </View>
    ));
  };
  //this section handles the reps section of tracking strength exercises
  const renderSetInputs = () => {
    return currentSets.map((set, index) => (
      <View key={index} style={styles.setInputContainer}>
        <Text style={styles.setLabel}>Set {set.set}</Text>
        <TextInput
          style={styles.input}
          placeholder="Reps"
          value={set.reps}
          keyboardType="numeric"
          onChangeText={(text) => {
            const updatedSets = [...currentSets];
            updatedSets[index].reps = text;
            setCurrentSets(updatedSets);
          }}
        />
        <TextInput
          style={styles.input}
          placeholder="Weight"
          value={set.weight}
          keyboardType="numeric"
          onChangeText={(text) => {
            const updatedSets = [...currentSets];
            updatedSets[index].weight = text;
            setCurrentSets(updatedSets);
          }}
        />
      </View>
    ));
  };

  //this section renders workouts logs by the user
  const renderWorkoutLogs = () => {
    //loop through the recentWorkouts array
    return recentWorkouts.map((log, index) => {
      //check if this workout is a cardio type
      const isCardio = log.workout_type === 'cardio';
      //each workout gets wrapped in a view container
      return (
        <View key={index} style={styles.logContainer}>
            {/* workout title with a label depending on the type */}
          <Text style={styles.logHeader}>
            {log.exercise} {isCardio ? '(Cardio)' : '(Strength)'}
          </Text>
          {/* if it's a cardio workout, show duration + distance + notes */}
          {isCardio ? (
            <>
            {/* only show duration if it exists */}
              {log.duration && (
                <Text style={styles.logText}>Duration: {log.duration} minutes</Text>
              )}
              {/* only show distance if it's been logged */}
              {log.distance && (
                <Text style={styles.logText}>Distance: {log.distance} km</Text>
              )}
              {/* notes if user added any extra comments */}
              {log.notes && (
                <Text style={styles.logText}>Notes: {log.notes}</Text>
              )}
            </>
          ) : (
            <>
            {/* if it's not cardio, it's a strength workout with sets, reps and weight */}
              {log.sets.map((set, setIndex) => (
                <Text key={setIndex} style={styles.logText}>
                  Set {set.set}: {set.reps} reps, {set.weight} kg
                </Text>
              ))}
            </>
          )}
          {/* delete button to remove workout */}
          <Button
            title="Delete Workout"
            onPress={() => handleDeleteWorkout(log.id)}
            color="red" //deliberate colour choice
          />
        </View>
      );
    });
  };
  //states to control the serving picker and which food is active
  const [isServingPickerVisible, setIsServingPickerVisible] = useState(false);
  const [activeFood, setActiveFood] = useState(null);
  //this one renders the search results for food items
  const renderSearchResults = () => {
    //show a spinner if search is still happening
    if (isSearching) {
      return <ActivityIndicator size="large" color="#5e81f4" />;
    }
  
     //map over searchResults to show food cards
    return searchResults.map((item, index) => (
      <View key={index} style={styles.foodItem}>
        {/* name of the food */}
        <Text style={styles.foodName}>{item.name}</Text>
        {/* default serving size info */}
        <Text>Serving: {item.serving_size_g}g</Text>
        
        {/* show calories, protein, carbs, fat all from api */}
        <Text>Calories: {item.calories}</Text>
        <Text>Protein: {item.protein_g}g</Text>
        <Text>Carbs: {item.carbohydrates_total_g}g</Text>
        <Text>Fat: {item.fat_total_g}g</Text>

        {/* container for serving input and log button */}
        <View style={styles.servingContainer}>
            {/* input field to enter how many servings */}
          <TextInput
            style={styles.servingInput}
            placeholder="Servings"
            keyboardType="numeric"
            value={selectedServing}
            onChangeText={setSelectedServing}
          />
          {/* button to actually log the food */}
          <Button 
            title="Log Nourishment"  //nourishment over 'food'
            onPress={() => logNutrition(item)} 
            disabled={!selectedServing || isNaN(Number(selectedServing))}
          />
        </View>
      </View>
    ));
  };

  //this whole section handles the nutrition tracking section
  const renderNutritionSection = () => (
    <>
      {/* section with 3 meal options: breakfast, lunch, dinner */}
      <View style={styles.mealBoxesContainer}>
        {/* breakfast box*/}
        <TouchableOpacity 
          style={[styles.mealBox, selectedMealBox === 'breakfast' ? styles.selectedMealBox : null]} 
          onPress={() => setSelectedMealBox(selectedMealBox === 'breakfast' ? null : 'breakfast')}
        >
          <Text style={styles.mealBoxTitle}>Breakfast</Text>
          <Text style={styles.mealBoxSubtitle}>Log your morning meal</Text>
        </TouchableOpacity>
        {/* lunch box */}
        <TouchableOpacity 
          style={[styles.mealBox, selectedMealBox === 'lunch' ? styles.selectedMealBox : null]} 
          onPress={() => setSelectedMealBox(selectedMealBox === 'lunch' ? null : 'lunch')}
        >
          <Text style={styles.mealBoxTitle}>Lunch</Text>
          <Text style={styles.mealBoxSubtitle}>Log your midday meal</Text>
        </TouchableOpacity>

        {/* dinner box */}
        <TouchableOpacity 
          style={[styles.mealBox, selectedMealBox === 'dinner' ? styles.selectedMealBox : null]} 
          onPress={() => setSelectedMealBox(selectedMealBox === 'dinner' ? null : 'dinner')}
        >
          <Text style={styles.mealBoxTitle}>Dinner</Text>
          <Text style={styles.mealBoxSubtitle}>Log your evening meal</Text>
        </TouchableOpacity>
      </View>
  
      {/* display food search UI only when a meal box is selected*/}
      {selectedMealBox && (
        <>
        {/* header showing which meal you're adding to */}
          <View style={styles.selectedMealHeader}>
            <Text style={styles.selectedMealTitle}>
              Adding food to {selectedMealBox.charAt(0).toUpperCase() + selectedMealBox.slice(1)}
            </Text>
            {/* cancel button to close the selected meal UI */}
            <TouchableOpacity onPress={() => setSelectedMealBox(null)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/*this wraps the entire search bar*/}
          <View style={styles.searchContainer}>
            {/* search input field with search and toggle buttons */}
            <View style={styles.searchInputWrapper}>
              <TextInput
                style={[styles.searchInput, { flex: 1 }]} //stretch input across the available space
                placeholder="Search for food..."
                value={searchQuery}
                onChangeText={handleSearchInputChange} //user types, update state
              />
              {/* button to trigger search manually */}
              <TouchableOpacity
                style={styles.searchButton}
                onPress={searchFood}
              >
                <Text style={styles.buttonText}>Search</Text>
                {/* button to switch between manual entry and search */}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modeToggleButton}
                onPress={() => setIsManualMode(!isManualMode)} //flips the mode
              >
                <Text style={styles.buttonText}>
                  {isManualMode ? 'Search Mode' : 'Manual Entry'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* dropdown suggestion list but only if not in manual mode & query is long enough */}
            {!isManualMode && searchQuery.length >= 2 && searchSuggestions.length > 0 && (
              <View style={styles.suggestionsDropdown}>

                {/* map over suggestions and render each */}
                {searchSuggestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setSearchQuery(item.name);
                      setSearchSuggestions([]);
                      searchFood();
                    }}
                  >
                    <Text style={styles.suggestionText}>{item.name}</Text>
                    <Text style={styles.suggestionDetails}>
                      {item.serving_size_g}g • {item.calories} cal
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* spinner shows up while searching */}
          {isSearching && (
            <ActivityIndicator size="large" color="#0d0dd4" style={styles.loadingIndicator} />
          )}

          {/* search results after you press search */}
          {searchResults.length > 0 && (
            <ScrollView style={styles.searchResultsContainer}>
              {renderSearchResults()}
            </ScrollView>
          )}

          {/* custom modal component to pick serving size */}
          <ServingPicker
            isVisible={isServingPickerVisible}
            onClose={() => setIsServingPickerVisible(false)} //close it
            currentValue={selectedServing}
            onSelect={(value) => {
              setSelectedServing(value); //update selected value
              if (activeFood) {
                //when user picks a serving, log it straight away
                const logWithMeal = async () => {
                  await logNutrition(activeFood); //backend call
                  //reset meal box selection
                  setSelectedMealBox(null);
                };
                logWithMeal();
                setActiveFood(null); //clear active food
              }
            }}
          />

          {/* form to manually enter a food but only shows when user is in manual mode */}
          {isManualMode ? (
  <View style={styles.manualEntryContainer}>
    <Text style={styles.manualEntryTitle}>Manual Food Entry</Text>
    
    <TextInput
      style={styles.input}
      placeholder="Food Name"
      value={manualEntry.food_name}
      onChangeText={(text) => setManualEntry({...manualEntry, food_name: text})}
    />
    
    <View style={styles.rowContainer}>
      <TextInput
        style={[styles.input, { flex: 1, marginRight: 5 }]}
        placeholder="Serving Size"
        keyboardType="numeric"
        value={manualEntry.serving_size}
        onChangeText={(text) => setManualEntry({...manualEntry, serving_size: text})}
      />
      
      <TextInput
        style={[styles.input, { flex: 1, marginLeft: 5 }]}
        placeholder="Unit (g, ml, oz)"
        value={manualEntry.serving_unit}
        onChangeText={(text) => setManualEntry({...manualEntry, serving_unit: text})}
      />
    </View>
    
    <TextInput
      style={styles.input}
      placeholder="Calories"
      keyboardType="numeric"
      value={manualEntry.calories}
      onChangeText={(text) => setManualEntry({...manualEntry, calories: text})}
    />
    
    <TextInput
      style={styles.input}
      placeholder="Protein (g)"
      keyboardType="numeric"
      value={manualEntry.protein}
      onChangeText={(text) => setManualEntry({...manualEntry, protein: text})}
    />
    
    <TextInput
      style={styles.input}
      placeholder="Carbohydrates (g)"
      keyboardType="numeric"
      value={manualEntry.carbohydrates}
      onChangeText={(text) => setManualEntry({...manualEntry, carbohydrates: text})}
    />
    
    <TextInput
      style={styles.input}
      placeholder="Fat (g)"
      keyboardType="numeric"
      value={manualEntry.fat}
      onChangeText={(text) => setManualEntry({...manualEntry, fat: text})}
    />
    
    <TouchableOpacity 
      style={styles.saveButton}
      onPress={handleManualEntrySubmit}
    >
      <Text style={styles.saveButtonText}>Log Food</Text>
    </TouchableOpacity>
  </View>
) : null}
        </>
      )}
  
      {/* if no meal selected show a small prompt */}
      {!selectedMealBox && (
        <View style={styles.mealPromptContainer}>
          <Text style={styles.mealPromptText}>Select a meal above to log food</Text>
        </View>
      )}
    </>
  );
  
  //this function displays all nutrition logs
  const renderNutritionLogs = () => {
    
    console.log('rendering nutrition logs, total entries ', recentNutrition?.length || 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0); //set to start of day
        
    //grab only logs from today
    const todaysLogs = recentNutrition.filter(log => {
      if (!log.date_logged) {
        console.log('Log missing date_logged:', log);
        return false;
      }
      const logDate = new Date(log.date_logged);
      logDate.setHours(0, 0, 0, 0); //set to start of day
      //timestamp comparison
      return logDate.getTime() === today.getTime();
    });
    
    console.log('Today\'s logs count:', todaysLogs.length);
    
    //group logs by time of day
    const getTimeOfDay = (dateString) => {
      if (!dateString) return 'unknown';
      
      const date = new Date(dateString);
      const hour = date.getHours();
      
      if (hour >= 5 && hour < 11) return 'breakfast';
      if (hour >= 11 && hour < 16) return 'lunch';
      if (hour >= 16 && hour < 22) return 'dinner';
      return 'other';
    };
    
    //split logs by meal time
    const breakfastLogs = todaysLogs.filter(log => getTimeOfDay(log.date_logged) === 'breakfast');
    const lunchLogs = todaysLogs.filter(log => getTimeOfDay(log.date_logged) === 'lunch');
    const dinnerLogs = todaysLogs.filter(log => getTimeOfDay(log.date_logged) === 'dinner');
    const otherTodayLogs = todaysLogs.filter(log => getTimeOfDay(log.date_logged) === 'other');
    
    //here is where the older logs appear
    const previousLogs = recentNutrition.filter(log => {
      if (!log.date_logged) return false;
      
      const logDate = new Date(log.date_logged);
      logDate.setHours(0, 0, 0, 0); //set to start of day
      
      //timestamp comparison
      return logDate.getTime() < today.getTime(); //oly logs from past days
    });
    
    console.log('Previous logs count:', previousLogs.length);
    
    //helper function to format log entry
    const renderLogEntry = (log, index, mealType) => (
      <View key={`${mealType}-${index}-${log.id}`} style={styles.logContainer}>
        <Text style={styles.logHeader}>{log.food_name}</Text>
        <Text style={styles.logTime}>
          {new Date(log.date_logged || new Date()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
        <Text>Serving: {log.serving_size} {log.serving_unit}</Text>
        <Text>Calories: {log.calories}</Text>
        <Text>Protein: {log.protein}g</Text>
        <Text>Carbs: {log.carbohydrates}g</Text>
        <Text>Fat: {log.fat}g</Text>
        <Button
          title="Delete"
          onPress={() => {
            deleteNutritionLog(log.id);
          }}
          color="red"
        />
      </View>
    );
    return (
      <>
        <Text style={styles.logSectionTitle}>Today's Meals</Text>
        {/*breakfast */}
        {breakfastLogs.length > 0 && (
          <View style={styles.mealLogSection}>
            <Text style={styles.mealTypeHeader}>Breakfast</Text>
            {breakfastLogs.map((log, index) => renderLogEntry(log, index, 'breakfast'))}
          </View>
        )}
        
        {/*lunch logs */}
        {lunchLogs.length > 0 && (
          <View style={styles.mealLogSection}>
            <Text style={styles.mealTypeHeader}>Lunch</Text>
            {lunchLogs.map((log, index) => renderLogEntry(log, index, 'lunch'))}
          </View>
        )}
        
        {/*dinner logs */}
        {dinnerLogs.length > 0 && (
          <View style={styles.mealLogSection}>
            <Text style={styles.mealTypeHeader}>Dinner</Text>
            {dinnerLogs.map((log, index) => renderLogEntry(log, index, 'dinner'))}
          </View>
        )}
        
        {/*other logs from today */}
        {otherTodayLogs.length > 0 && (
          <View style={styles.mealLogSection}>
            <Text style={styles.mealTypeHeader}>Other</Text>
            {otherTodayLogs.map((log, index) => renderLogEntry(log, index, 'other'))}
          </View>
        )}
        
        {/*if there are no logs for today */}
        {todaysLogs.length === 0 && (
          <Text style={styles.noMealsText}>No meals logged today</Text>
        )}
        
        {/*prrevious days' logs */}
        {previousLogs.length > 0 && (
          <>
            <Text style={styles.logSectionTitle}>Previous Meals</Text>
            {previousLogs.map((log, index) => (
              <View key={`previous-${index}-${log.id}`} style={styles.logContainer}>
                <Text style={styles.logHeader}>{log.food_name}</Text>
                <Text style={styles.logDate}>
                  {new Date(log.date_logged || new Date()).toLocaleDateString()} {new Date(log.date_logged || new Date()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
                <Text>Serving: {log.serving_size} {log.serving_unit}</Text>
                <Text>Calories: {log.calories}</Text>
                <Text>Protein: {log.protein}g</Text>
                <Text>Carbs: {log.carbohydrates}g</Text>
                <Text>Fat: {log.fat}g</Text>
                <Button
                  title="Delete"
                  onPress={() => {
                    deleteNutritionLog(log.id);
                
                  }}
                  color="red" //intentional choice of colour
                />
              </View>
            ))}
          </>
        )}
      </>
    );
  };

  //main return - shows tabbed interface and conditional render for each tab
  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {/* 3 tab buttons */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'workout' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => setActiveTab('workout')}
        >
          <Text style={[styles.tabText, activeTab === 'workout' ? styles.activeTabText : styles.inactiveTabText]}>Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'nutrition' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => setActiveTab('nutrition')}
        >
          <Text style={[styles.tabText, activeTab === 'nutrition' ? styles.activeTabText : styles.inactiveTabText]}>Nutrition</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'mindfulness' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => setActiveTab('mindfulness')}
        >
          <Text style={[styles.tabText, activeTab === 'mindfulness' ? styles.activeTabText : styles.inactiveTabText]}>Mindfulness</Text>
        </TouchableOpacity>
      </View>
      {/* content below tab */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer}>
  {activeTab === 'workout' ? (
    <>
      {renderWorkoutSection()}
      <View style={styles.sectionDivider} />
      <Text style={styles.sectionHeader}>Recent Workout Logs</Text>
      {renderWorkoutLogs()}
    </>
  ) : activeTab === 'nutrition' ? (
    <>
      {renderNutritionSection()}
      <View style={styles.sectionDivider} />
      <Text style={styles.sectionHeader}>Recent Food Logs</Text>
      {renderNutritionLogs()}
    </>
  ) : (
    <>
      {renderMindfulnessSection()}
      <View style={styles.sectionDivider} />
      <Text style={styles.sectionHeader}>Recent Mindfulness Logs</Text>
      {renderMindfulnessLogs()}
    </>
  )}
</ScrollView>
    
    </View>
  );};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 50,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#0d0dd4',
    borderColor: '#0d0dd4',
  },
  inactiveTab: {
    backgroundColor: '#f0f0f0',
    borderColor: '#d3d3d3',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  inactiveTabText: {
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  setInputContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  setLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  logContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  logText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  foodItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  servingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  servingInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  modeToggleButton: {
    backgroundColor: '#0d0dd4',
    padding: 10,
    borderRadius: 8,
  },
  suggestionsContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  manualEntryContainer: {
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#0d0dd4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  searchResultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 5,
    maxHeight: 200,
    width: '100%',
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchResultText: {
    fontSize: 16,
    color: '#333',
  },
  searchResultHighlight: {
    color: '#666',
    fontSize: 14,
  }
,
searchButton: {
    backgroundColor: '#0d0dd4',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 200,
  },
sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  sliderValue: {
    width: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#0d0dd4',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  sectionContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  saveButton: {
    backgroundColor: '#0d0dd4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mindfulnessStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    marginRight: 15,
    marginBottom: 5,
  },
  statLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  statValue: {
    color: '#0d0dd4',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  mealBoxesContainer: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  mealBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMealBox: {
    borderColor: '#0d0dd4',
    borderWidth: 2,
    backgroundColor: '#f0f8ff',
  },
  mealBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  mealBoxSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  selectedMealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedMealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d0dd4',
  },
  cancelButton: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '500',
  },
  mealPromptContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginVertical: 10,
  },
  mealPromptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  logSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#0d0dd4',
  },
  mealTypeHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 8,
    color: '#0d0dd4',
  },
  mealLogSection: {
    marginBottom: 15,
  },
  logDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  noMealsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 15,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  suggestionDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  workoutTypeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#blue',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#blue',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedWorkoutType: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  searchResultsContainer: {
    maxHeight: 400,
    marginTop: 10,
  },
});

export default TrackingScreen;
