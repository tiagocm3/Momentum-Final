import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

//this interface is for the user's profile data I get from the backend
interface ProfileData {
  username: string;
  email: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  activity_level?: string;
  calorie_goal?: string;
  first_login_date?: string;
  workout_logs_count?: number;
  nutrition_logs_count?: number;
}
//keeps track of app usage stats such as how long the user hs been using the app,etc...
interface UsageStats {
  daysUsing: number;
  workoutStreak: number;
  totalWorkouts: number;
  percentGoalsCompleted: number;
  totalNutritionLogs: number;
}

//this is for  goals users set
interface Goal {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  date_created: string;
  completion_date: string | null;
  goal_type: 'physical' | 'mental';
}
//keeps the calculated calorie info depending on if user wants to maintain, lose, or gain weight
interface CalorieInfo {
  maintenance: number;
  lose: number;
  gain: number;
}

//main component function
const ProfileScreen = ({ navigation }) => {
  //where I store profile data after fetching it from the api
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  //loading state for showing spinners or placeholders while it fetches 
  const [loading, setLoading] = useState(true);
  //error message if something goes wrong while fetching
  const [error, setError] = useState('');
  //keeps track of which tab is active (physical or mental)
  const [activeTab, setActiveTab] = useState('physical');
  
  //form inputs for updating physical data like weight, height, etc...
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [calorieGoal, setCalorieGoal] = useState('maintain'); //this is a default goal

  //stores the calculated calorie breakdown once the user fills in data
  const [calorieInfo, setCalorieInfo] = useState<CalorieInfo | null>(null);

  //controls whether the modal for editing physical info is shown
  const [isModalVisible, setIsModalVisible] = useState(false);

  //spinner state when saving physical data to backend
  const [isSaving, setIsSaving] = useState(false);
  
  //stores usage stats like streaks, days logged in, etc...
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  //saves current date to display how long user's been using the app
  const [currentDate, setCurrentDate] = useState('');

  //this is for updating account settings
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

  //goal states
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalType, setNewGoalType] = useState('physical');
  const [isAddGoalModalVisible, setIsAddGoalModalVisible] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(false);
    
  //dropdown states
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [showGoalDropdown, setShowGoalDropdown] = useState(false);

  //gender options
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];
  
  //when calculating calories, these are the activity level options
  const activityOptions = [
    { label: 'Sedentary (little or no exercise)', value: 'sedentary' },
    { label: 'Lightly Active (light exercise 1-3 days/week)', value: 'light' },
    { label: 'Moderately Active (moderate exercise 3-5 days/week)', value: 'moderate' },
    { label: 'Very Active (hard exercise 6-7 days/week)', value: 'active' },
    { label: 'Extra Active (very hard exercise & physical job)', value: 'extra' },
  ];
  
  //whether user wants to maintain, lose or gsin, with maintain being default
  const goalOptions = [
    { label: 'Maintain Weight', value: 'maintain' },
    { label: 'Lose Weight', value: 'lose' },
    { label: 'Gain Weight', value: 'gain' },
  ];

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        //sets current date
        updateCurrentDate();
        //makes sure there sis a first login date stored
        await ensureFirstLoginDate();
        //pulls user profile and goals data
        await fetchProfile();
        await fetchGoals(); } catch (err) {
        console.error('Initialization error:', err);
        setError('Profile failedd to innitialise');
      }
    };
    initializeProfile();
  }, []);

  useEffect(() => {
    console.log('Profile/Goals data changed. Profile:', !!profileData, 'Goals length:', goals.length);
    if (profileData) {
      //calculates user stats
      calculateUsageStats(profileData, goals);
    } }, [profileData, goals]);
  useEffect(() => {
    if (profileData) { //sets the newEmail field when profile loads
      setNewEmail(profileData.email || '');
    }
  }, [profileData]);
  //function to update email or password
  const updateAccountSettings = async () => { 
    try {
      setIsUpdatingAccount(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }
      //basic password match check
      if (newPassword && newPassword !== confirmPassword) {
        Alert.alert('Error', 'New passwords do not match!'); //if password doesn't match
        setIsUpdatingAccount(false);
        return;
      }
      //prepare data for update
      const updateData: any = {};
      //only include email if it has changed
      if (newEmail && newEmail !== profileData?.email) {
        updateData.email = newEmail;
      }      
      //only include password if user entered one
      if (newPassword) {
        updateData.current_password = currentPassword;
        updateData.new_password = newPassword;
      }     
      //if nothing has changed display message
      if (Object.keys(updateData).length === 0) {
        Alert.alert('no changes to update');
        setIsAccountModalVisible(false);
        setIsUpdatingAccount(false);
        return;
      }
      
      //send a patch request to update the user account information
      const response = await fetch('http://127.0.0.1:8000/momentum/update-account-api/', {
        method: 'PATCH',
        headers: {
          //// Include the user's auth token for authorization
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json', //indicate theat Json data is being sent
        },
        body: JSON.stringify(updateData),
      });
      
      //check if response is ok
      if (response.ok) {
        //parse the JSON response from the server
        const data = await response.json();
        
        //update the local state if email was changed
        if (updateData.email) {
          setProfileData(prev => prev ? {...prev, email: updateData.email} : null);
        }
        
        //reset fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        //close the modal and show success
        setIsAccountModalVisible(false);
        Alert.alert('Success!!!', 'Your account info was updated successfully');
      } else {
        //handle error response
        const errorData = await response.json();
        Alert.alert('Error', errorData?.message || 'Failed to update account information!');
      }
    } catch (err) {
      console.error('Error updating your account:', err); //if update fails
      Alert.alert('Error,', 'something went wrong so please try again.');
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  //renders the account tab content (username + email display)
  const renderAccountTab = () => {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <View style={styles.accountInfoCard}>
          <Text style={styles.accountInfoItem}>
            <Text style={styles.accountInfoLabel}>Username: </Text>
            <Text style={styles.accountInfoValue}>{profileData?.username}</Text>
          </Text>
          
          <Text style={styles.accountInfoItem}>
            <Text style={styles.accountInfoLabel}>Email: </Text>
            <Text style={styles.accountInfoValue}>{profileData?.email}</Text>
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.updateButton}
          onPress={() => setIsAccountModalVisible(true)}
        >
          <Text style={styles.updateButtonText}>Update Account Information</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  //sets a first login date if one isn't found
  const ensureFirstLoginDate = async () => {
    try {
      const storedDate = await AsyncStorage.getItem('firstLoginDate');
      //if there isn't a stored date, store today's date
      if (!storedDate) {
        const now = new Date().toISOString();
        await AsyncStorage.setItem('firstLoginDate', now);
        console.log('set initial firstLoginDate:', now);
      } else { //if first login date is found:
        console.log('found existing firstLoginDate:', storedDate);
      } //if error: 
    } catch (err) {
      console.error('Error checking firstLoginDate:', err);
    }
  };

  //sets the currentDate state 
  const updateCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(date.toLocaleDateString(undefined, options));
  };
  
  //returns number of days since the first login to motivate users
  const calculateDaysUsing = (firstLoginDate: string | undefined) => {
    if (!firstLoginDate) return 0; //if there isn't a first login date return nothing
    
    const firstDate = new Date(firstLoginDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - firstDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  //builds and sets the usage stats object
  const calculateUsageStats = (profileData: ProfileData, goals: Goal[]) => {
    console.log('calculating usage stats using profile data:', profileData);
    
    //get first login date from profile data or from AsyncStorage
    const getFirstLoginDate = async () => {
      try {
        //attempt to getfrom profile data first
        if (profileData.first_login_date) {
          console.log('using first_login_date from the profile:', profileData.first_login_date);
          return profileData.first_login_date;
        }
        
        //try AsyncStorage if it isnt in profile data
        const storedDate = await AsyncStorage.getItem('firstLoginDate');
        console.log('Attempting firstLoginDate from AsyncStorage:', storedDate);
        return storedDate;
      } catch (err) {
        console.error('Error getting firstLoginDate:', err);
        return null;
      }
    };
    
    // calculate days using the app
    getFirstLoginDate().then(firstLoginDate => {
      if (!firstLoginDate) {
        console.warn('no first login date found so setting usageStats with default values');
        //set default values if there is no date available
        setUsageStats({
          daysUsing: 1, //assume at least one dat using
          workoutStreak: profileData.workout_logs_count ? 1 : 0, //start streak at 1
          totalWorkouts: profileData.workout_logs_count || 0,
          percentGoalsCompleted: 0,
          totalNutritionLogs: profileData.nutrition_logs_count || 0
        });
        return;
      }
      
      //calculate actual days using Momentum
      const firstDate = new Date(firstLoginDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - firstDate.getTime());
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      
      console.log('days using app calculated', diffDays);
      
      //calculate goal completion percentage
      const completedGoals = goals.filter(goal => goal.is_completed).length;
      const percentGoalsCompleted = goals.length > 0 
        ? Math.round((completedGoals / goals.length) * 100) 
        : 0;
      
      //grab workouts + nutrition logs from profile
      const totalWorkouts = profileData.workout_logs_count || 0;
      const totalNutritionLogs = profileData.nutrition_logs_count || 0;
      
      //bundle stats up in an object
      const stats = {
        daysUsing: diffDays,
        totalWorkouts,
        percentGoalsCompleted,
        totalNutritionLogs
      };
      
      console.log('etting usage stats ', stats);
      setUsageStats(stats);
    });
  };
  
  const fetchProfile = async () => {
    try {
      setLoading(true); //show loading spinner

      //get stored auth token from local storage
      const token = await AsyncStorage.getItem('authToken');
      console.log('Stored Token:', token ? 'token exists' : 'no token');
      
      if (!token) { //if no token
        setError('no authentication token has been found!');
        setLoading(false);
        return;
      }
      
      //api request to get user profile data
      console.log('fetching user profile data');
      const response = await fetch('http://127.0.0.1:8000/momentum/profile-api/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  

      //handle HTTP errors
      if (!response.ok) { //if error
        const errorData = await response.json();
        throw new Error(errorData?.email || `http error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('profile data received ', data);
      
      //handle the first login date
      const firstLoginDate = data.first_login_date || await AsyncStorage.getItem('firstLoginDate');
      
      //sync server's value to local if not present
      if (data.first_login_date && !await AsyncStorage.getItem('firstLoginDate')) {
        await AsyncStorage.setItem('firstLoginDate', data.first_login_date);
        console.log('Saved server first_login_date to AsyncStorage:', data.first_login_date);
      } else if (!data.first_login_date && await AsyncStorage.getItem('firstLoginDate')) {

        //use local value if server doesn't have it
        const localDate = await AsyncStorage.getItem('firstLoginDate');
        console.log('Using local firstLoginDate:', localDate);
        data.first_login_date = localDate;
      } else if (!data.first_login_date && !await AsyncStorage.getItem('firstLoginDate')) {

        //if both are missing create a new one
        const now = new Date().toISOString();
        await AsyncStorage.setItem('firstLoginDate', now);
        data.first_login_date = now;
        console.log('Created new firstLoginDate:', now);
      }
      
      //storeprofile data in state
      setProfileData(data);
      
      //populate form fields if values exist
      if (data.weight) setWeight(data.weight.toString());
      if (data.height) setHeight(data.height.toString());
      if (data.age) setAge(data.age.toString());
      if (data.gender) setGender(data.gender);
      if (data.activity_level) setActivityLevel(data.activity_level);
      if (data.calorie_goal) setCalorieGoal(data.calorie_goal);
      
      //calcculate calories if it has all the data
      if (data.weight && data.height && data.age && data.gender && data.activity_level) {
        calculateCalories(
          data.weight,
          data.height,
          data.age,
          data.gender,
          data.activity_level
        );
      }
      
      console.log('profile fetch and processing complete!');
    } catch (err) {
      console.error('error in fetchProfile ', err);
      setError('failed to fetch profile  ' + (err.message || 'unknown error'));
    } finally {
      setLoading(false); //hide loading spinner
    }
  };
  
  const fetchGoals = async () => {
    try {
      setLoadingGoals(true); //start loading indicator for goals
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) { //if no token is found
        setError('no authentication token has been found!');
        return;
      }
      
      //api call to fetch goals
      const response = await fetch('http://127.0.0.1:8000/momentum/goals-api/', { //the url
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setGoals(data); //set goal data in state
        
        //compare goals with profile if profile already loaded
        if (profileData) {
          calculateUsageStats(profileData, data);
        }
      } else {
        setError(data?.message || 'failed to fetch goals');
      }
    } catch (err) {
      setError('something has gone wrong while fetching goals!');
    } finally {
      setLoadingGoals(false); //hide the loading indicator
    }
  };

  //function to calculate calories and update state
  const calculateCalories = (weight: number, height: number, age: number, gender: string, activityLevel: string) => {
    const calculatedValues = calculateCaloriesReturnValues(weight, height, age, gender, activityLevel);

    //if calculation worksstore results in state
    if (calculatedValues) {
      setCalorieInfo(calculatedValues);
    }
  };

  //function to calculate calories and return values
  const calculateCaloriesReturnValues = (weight: number, height: number, age: number, gender: string, activityLevel: string) => {
    //this is the bmr calculation using Mifflin-St Jeor Equation
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    //the activitymultiplier
    let activityMultiplier = 1.2;
    switch (activityLevel) {
      case 'sedentary':
        activityMultiplier = 1.2;
        break;
      case 'light':
        activityMultiplier = 1.375;
        break;
      case 'moderate':
        activityMultiplier = 1.55;
        break;
      case 'active':
        activityMultiplier = 1.725;
        break;
      case 'extra':
        activityMultiplier = 1.9;
        break;
    }
    
    const maintenance = Math.round(bmr * activityMultiplier);
    const lose = Math.round(maintenance - 500); // 500 calorie deficit for weight loss
    const gain = Math.round(maintenance + 500); // 500 calorie surplus for weight gain,  but can be argued to be 300 kcals
    return { maintenance, lose, gain };
  };

//handles logout by clearing token and taking user back to login screen
const handleLogout = async () => {
  try {
    //clear the suth token 
    await AsyncStorage.removeItem('authToken');
    
    //navigate to LoginScreen after logout
    navigation.navigate('LoginScreen');

  } catch (error) {
    console.error('error during logout:', error);
  }
};

//function to add a new goal 
const addGoal = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    //if no token, block the request
    if (!token) {
      setError('no authentication token has been found!');
      return;
    }
    
    //create the new goal object to send
    const newGoal = {
      title: newGoalTitle, //title of goal
      description: newGoalDescription, //description
      goal_type: newGoalType //type of goal
    };

    //send POST request to backend with the new goal    
    const response = await fetch('http://127.0.0.1:8000/momentum/goals-api/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGoal),
    });

    const data = await response.json();

    if (response.ok) {
      //add the new goal to state and then close the modal
      setGoals([...goals, data]);
      setIsAddGoalModalVisible(false);
      setNewGoalTitle('');
      setNewGoalDescription('');
    } else {
      setError(data?.message || 'failed to add the goal');
    }
  } catch (err) {
    setError('something went wrong while adding goal!');
  }
};

//function to update user profile info (called when submitting the update profile modal)
const updateProfile = async () => {
  try {
    setIsSaving(true);
    const token = await AsyncStorage.getItem('authToken');
    
    if (!token) { //if not token is found
      setError('No authentication token found');
      return;
    }

    //convert input values to correct types
    const userWeight = parseFloat(weight);
    const userHeight = parseFloat(height);
    const userAge = parseInt(age);
    
    //calculate calorie values using helper function
    const calculatedCalories = calculateCaloriesReturnValues(
      userWeight,userHeight,userAge,gender,activityLevel
    );
    
    //store calorie goal in local storage
    if (calculatedCalories) {
      await AsyncStorage.setItem('calorieGoal', calorieGoal);
      
      //pick correct calorie value depending on user's goal
      let targetCalories = calculatedCalories.maintenance;
      if (calorieGoal === 'lose') {
        targetCalories = calculatedCalories.lose;
      } else if (calorieGoal === 'gain') {
        targetCalories = calculatedCalories.gain;
      }
      await AsyncStorage.setItem('targetCalories', targetCalories.toString());
    }
    
    //create update payload
    const userUpdates = {
      weight: userWeight,
      height: userHeight,
      age: userAge,
      gender,
      activity_level: activityLevel,
      calorie_goal: calorieGoal,
    };
    
    //send PATCH request to backend
    const response = await fetch('http://127.0.0.1:8000/momentum/update-profile-api/', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userUpdates),
    });

    const data = await response.json();

    if (response.ok) {
      // update local profile state and calorie info
      setProfileData({...profileData, ...userUpdates});
      setCalorieInfo(calculatedCalories);
      setIsModalVisible(false);
      
      //recalculate stats if they're already loaded
      if (usageStats && goals.length > 0) {
        calculateUsageStats({...profileData, ...userUpdates}, goals);
      }
    } else {
      setError(data?.message || 'failed to update the profile!');
    }
  } catch (err) {
    setError('something went wrong,  please try again!');
    console.error(' error updating the profile ', err);
  } finally {
    setIsSaving(false);
  }
};

//function to toggle goal completion 
const toggleGoalCompletion = async (goal: Goal) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    //if no token
    if (!token) {
      setError('no authentication token has been found!');
      return;
    }
    //flip is_completed value and send PATCH to the backend
    const response = await fetch(`http://127.0.0.1:8000/momentum/goal-detail-api/${goal.id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_completed: !goal.is_completed }),
    });
    const data = await response.json();

    //update local state with new goal data
    if (response.ok) {
      setGoals(goals.map(g => g.id === goal.id ? data : g));
    } else {
      setError(data?.message || 'failed to update goals');
    }
    //if error: 
  } catch (err) {
    setError('something went wrong whilst updating the goal!');
  }
};

//function to delete a goal based on its id
const deleteGoal = async (goalId: number) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    //if token is missing
    if (!token) {
      setError('no authentication token has been found');
      return;
    }
    
    //make the delete request to backend
    const response = await fetch(`http://127.0.0.1:8000/momentum/goal-detail-api/${goalId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    //if successful remove the goal from the local state
    if (response.ok) {
      setGoals(goals.filter(g => g.id !== goalId));
    } else {
      const data = await response.json();
      setError(data?.message || 'Failed to delete goal');
    }
  } catch (err) {
    //catch any errors from the request
    setError('Something went wrong while deleting goal.');
  }
};

//stats overview section showing basic user stats (Days using, workouts and foods logged)
const renderStatsOverview = () => {
  if (!usageStats) return null;
  return (
    <View style={styles.statsContainer}>
      <Text style={styles.statsSectionTitle}>Your Journey Stats</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{usageStats.daysUsing}</Text>
          <Text style={styles.statLabel}>Days Using App</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{usageStats.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Workouts Logged</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{usageStats.totalNutritionLogs}</Text>
          <Text style={styles.statLabel}>Foods Logged</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, {flex: 1}]}>
          <Text style={styles.statValue}>{usageStats.percentGoalsCompleted}%</Text>
          <Text style={styles.statLabel}>Goals Completed</Text>
        </View>
      </View>
    </View>
  );
};

//tab for physical goals showing calorie info and goal list
const renderPhysicalTab = () => {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Physical Goals</Text>

      {/*show calorie target info*/}
      {calorieInfo ? (
        <View style={styles.calorieCard}>
          <Text style={styles.calorieTitle}>Your Daily Nourishment Targets</Text> {/*use terms such as nourishment over calories*/}
          <View style={styles.calorieItem}>
            <Text style={styles.calorieLabel}>Maintain Weight:</Text>
            <Text style={styles.calorieValue}>{calorieInfo.maintenance} kcals</Text>
          </View>
          <View style={styles.calorieItem}>
            <Text style={styles.calorieLabel}>Lose Weight:</Text>
            <Text style={styles.calorieValue}>{calorieInfo.lose} kcals</Text>
          </View>
          <View style={styles.calorieItem}>
            <Text style={styles.calorieLabel}>Gain Weight:</Text>
            <Text style={styles.calorieValue}>{calorieInfo.gain} kcals</Text>
          </View>
          
          <View style={styles.goalContainer}>
            <Text style={styles.goalText}>
              Your current goal: {getOptionLabel(goalOptions, calorieGoal)}
            </Text>
            <Text style={styles.targetText}>
              Target: {calorieGoal === 'maintain' ? calorieInfo.maintenance : 
                      calorieGoal === 'lose' ? calorieInfo.lose : calorieInfo.gain} Nourishment
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>No movement data is available so please update your profile !!</Text>
      )}
      
     {/* list of physical goals */}
      <View style={styles.goalsList}>
        <Text style={styles.goalsListTitle}>My Movement Goals</Text>
        
        {loadingGoals ? (
          <ActivityIndicator size="small" color="#0d0dd4" />
        ) : goals.filter(g => g.goal_type === 'physical').length > 0 ? (
          goals.filter(g => g.goal_type === 'physical').map(goal => (
            <View key={goal.id} style={styles.goalItem}>
              {/* checkbox to mark goal as done */}
              <TouchableOpacity 
                style={styles.goalCheckbox}
                onPress={() => toggleGoalCompletion(goal)}
              >
                {goal.is_completed ? (
                  <View style={styles.checkboxChecked} />
                ) : (
                  <View style={styles.checkboxUnchecked} />
                )}
              </TouchableOpacity>

              {/* goal text content */}
              <View style={styles.goalTextContainer}>
                <Text style={[
                  styles.goalTitle, 
                  goal.is_completed && styles.goalTitleCompleted
                ]}>
                  {goal.title}
                </Text>
                {goal.description ? (
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                ) : null}
              </View>
              
              {/* delete goal button */}
              <TouchableOpacity 
                style={styles.goalDelete}
                onPress={() => deleteGoal(goal.id)}
              >
                <Text style={styles.goalDeleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noGoalsText}>No Movement goals added yet!</Text>
        )}
      </View>
      
      {/* button to update calorie info */}
      <TouchableOpacity 
        style={styles.updateButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.updateButtonText}>Update Movement Data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.updateButton, { marginTop: 10, backgroundColor: '#4CAF50' }]}
        onPress={() => {
          setNewGoalType('physical');
          setIsAddGoalModalVisible(true);
        }}
      >
        <Text style={styles.updateButtonText}>Add New Goal</Text>
      </TouchableOpacity>
    </View>
  );
};


// tab for mental goals very similar structure as physical goals
const renderMentalTab = () => {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Mindfullness Goals</Text>
      
      {/* list of mental goals */}
      <View style={styles.goalsList}>
        <Text style={styles.goalsListTitle}>My Mindfull Goals</Text>
        
        {loadingGoals ? (
          <ActivityIndicator size="small" color="#0d0dd4" />
        ) : goals.filter(g => g.goal_type === 'mental').length > 0 ? (
          goals.filter(g => g.goal_type === 'mental').map(goal => (
            <View key={goal.id} style={styles.goalItem}>

              {/* toggle goal completion */}
              <TouchableOpacity 
                style={styles.goalCheckbox}
                onPress={() => toggleGoalCompletion(goal)}
              >
                {goal.is_completed ? (
                  <View style={styles.checkboxChecked} />
                ) : (
                  <View style={styles.checkboxUnchecked} />
                )}
              </TouchableOpacity>
              {/* goal title and description */}
              <View style={styles.goalTextContainer}>
                <Text style={[
                  styles.goalTitle, 
                  goal.is_completed && styles.goalTitleCompleted
                ]}>
                  {goal.title}
                </Text>
                {goal.description ? (
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                ) : null}
              </View>
              {/* delete goal */}
              <TouchableOpacity 
                style={styles.goalDelete}
                onPress={() => deleteGoal(goal.id)}
              >
                <Text style={styles.goalDeleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noGoalsText}>No mindfullness goals added yet.</Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={[styles.updateButton, { backgroundColor: '#4CAF50' }]}
        onPress={() => {
          setNewGoalType('mental');
          setIsAddGoalModalVisible(true);
        }}
      > {/* button to add new mental goal */}
        <Text style={styles.updateButtonText}>Add New Goal</Text>
      </TouchableOpacity>
    </View>
  );
};

//helper function to get the label of the selected option based on its value
const getOptionLabel = (options, value) => {
  const option = options.find(opt => opt.value === value);
  return option ? option.label : '';
};
//Custom dropdown component used for selecting gender, activity level,etc...
  const CustomDropdown = ({ label, selectedValue, options, onSelect, isOpen, toggleOpen }) => {
    return (
      <View style={styles.dropdownContainer}>
        {/* Button to toggle dropdown visibility */}
        <TouchableOpacity 
          style={styles.dropdownButton} 
          onPress={toggleOpen}
        >
          <Text style={styles.dropdownButtonText}>
            {getOptionLabel(options, selectedValue)}
          </Text>
        </TouchableOpacity>
        
        {/* Dropdown options */}
        {isOpen && (
          <View style={styles.dropdownOptions}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownOption,
                  selectedValue === option.value && styles.dropdownSelectedOption
                ]}
                onPress={() => {
                  onSelect(option.value);
                  toggleOpen();
                }}
              >
                <Text 
                  style={[
                    styles.dropdownOptionText,
                    selectedValue === option.value && styles.dropdownSelectedOptionText
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  //this is the main container for the screen content
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* header section with the faq button */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              Welcome back, {profileData?.username || 'User'}!
            </Text>
            {/* Display usage stats if there are any available */}
            <Text style={styles.date}>{currentDate}</Text>
            {usageStats && (
              <View style={styles.daysContainer}>
                <Text style={styles.daysCount}>{usageStats.daysUsing}</Text>
                <Text style={styles.daysLabel}>Days with Momentum</Text>
              </View>
            )}
          </View>
          {/* Navigate to faq screen */}
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => navigation.navigate('Help')}
          >
            <Text style={styles.helpButtonText}>?</Text>
          </TouchableOpacity>
        </View>
        {/*profile details and goals section */}
        <View style={styles.profileDetails}>
          {loading ? (
            <ActivityIndicator size="large" color="#0d0dd4" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : profileData ? (
            <>
              {/*user stats overview */}
              {renderStatsOverview()}

              {/*goals section with tab navigation */}
              <View style={styles.goalsSection}>
                <Text style={styles.goalsSectionTitle}>My Goals</Text>
                
                {/* tabs for switcing between goal types */}
                <View style={styles.tabNav}>
  <TouchableOpacity 
    style={[styles.tab, activeTab === 'physical' && styles.activeTab]}
    onPress={() => setActiveTab('physical')}
  >
    <Text style={[styles.tabText, activeTab === 'physical' && styles.activeTabText]}>
      Physical
    </Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={[styles.tab, activeTab === 'mental' && styles.activeTab]}
    onPress={() => setActiveTab('mental')}
  >
    <Text style={[styles.tabText, activeTab === 'mental' && styles.activeTabText]}>
      Mental
    </Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={[styles.tab, activeTab === 'account' && styles.activeTab]}
    onPress={() => setActiveTab('account')}
  >
    <Text style={[styles.tabText, activeTab === 'account' && styles.activeTabText]}>
      Account
    </Text>
  </TouchableOpacity>
</View>

                
{/* Render tab content based on selected tab */}
  {activeTab === 'physical' ? renderPhysicalTab() : activeTab === 'mental' ? renderMentalTab() : 
 renderAccountTab()}
  </View> </>
 ) : null}
</View>
      {/* Log out button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>

 {/* Modal to update physical data */}
<Modal
  animationType="slide"
  transparent={true}
  visible={isModalVisible}
  onRequestClose={() => setIsModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Update Physical Data</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Weight (kg):</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="Enter weight in kg"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Height (cm):</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          placeholder="Enter height in cm"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Age:</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          placeholder="Enter your age"
        />
      </View>
      {/* dropdowns for gender, activity level, and calorie goal */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Gender:</Text>
        <CustomDropdown
          label="Gender"
          selectedValue={gender}
          options={genderOptions}
          onSelect={setGender}
          isOpen={showGenderDropdown}
          toggleOpen={() => {
            setShowGenderDropdown(!showGenderDropdown);
            if (showActivityDropdown) setShowActivityDropdown(false);
            if (showGoalDropdown) setShowGoalDropdown(false);
          }}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Activity Level:</Text>
        <CustomDropdown
          label="Activity Level"
          selectedValue={activityLevel}
          options={activityOptions}
          onSelect={setActivityLevel}
          isOpen={showActivityDropdown}
          toggleOpen={() => {
            setShowActivityDropdown(!showActivityDropdown);
            if (showGenderDropdown) setShowGenderDropdown(false);
            if (showGoalDropdown) setShowGoalDropdown(false);
          }}
        />
      </View>
      
      {/*new goalropdown */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Calorie Goal:</Text>
        <CustomDropdown
          label="Calorie Goal"
          selectedValue={calorieGoal}
          options={goalOptions}
          onSelect={setCalorieGoal}
          isOpen={showGoalDropdown}
          toggleOpen={() => {
            setShowGoalDropdown(!showGoalDropdown);
            if (showGenderDropdown) setShowGenderDropdown(false);
            if (showActivityDropdown) setShowActivityDropdown(false);
          }}
        />
      </View>
      {/* Cancel and Save buttons */}
      <View style={styles.modalButtons}>
        <TouchableOpacity 
          style={[styles.modalButton, styles.cancelButton]}
          onPress={() => {
            setIsModalVisible(false);
            setShowGenderDropdown(false);
            setShowActivityDropdown(false);
            setShowGoalDropdown(false);
          }}
        >
          <Text style={styles.modalButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.modalButton, styles.saveButton]}
          onPress={updateProfile}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.modalButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

 {/*modal to update account settings */}
<Modal
  animationType="slide"
  transparent={true}
  visible={isAccountModalVisible}
  onRequestClose={() => setIsAccountModalVisible(false)}
>
  {/*modal to update account settings */}
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Update Account Information</Text>
      {/* email input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email:</Text>
        <TextInput
          style={styles.input}
          value={newEmail}
          onChangeText={setNewEmail}
          keyboardType="email-address"
          placeholder="Enter new email"
          autoCapitalize="none"
        />
      </View>
       {/* password change section (optional) */}
      <View style={styles.divider} />
      <Text style={styles.passwordSectionTitle}>Change Password (Optional)</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Password:</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={true}
          placeholder="Enter current password"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>New Password:</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={true}
          placeholder="Enter new password"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Confirm New Password:</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
          placeholder="Confirm new password"
        />
      </View>
      {/* cancel/save buttons */}
      <View style={styles.modalButtons}>
        <TouchableOpacity 
          style={[styles.modalButton, styles.cancelButton]}
          onPress={() => {
            setIsAccountModalVisible(false);
            // Reset fields
            setNewEmail(profileData?.email || '');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }}
        >
          <Text style={styles.modalButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.modalButton, styles.saveButton]}
          onPress={updateAccountSettings}
          disabled={isUpdatingAccount}
        >
          {isUpdatingAccount ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.modalButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

{/*modal to add new goals */}
<Modal
  animationType="slide"
  transparent={true}
  visible={isAddGoalModalVisible}
  onRequestClose={() => setIsAddGoalModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>
        Add New {newGoalType === 'physical' ? 'Physical' : 'Mental'} Goal
      </Text>
      {/*inputs for new goal title */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Title:</Text>
        <TextInput
          style={styles.input}
          value={newGoalTitle}
          onChangeText={setNewGoalTitle}
          placeholder="Enter goal title"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description (optional):</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={newGoalDescription}
          onChangeText={setNewGoalDescription}
          placeholder="Enter goal description"
          multiline={true}
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.modalButtons}>
        <TouchableOpacity 
          style={[styles.modalButton, styles.cancelButton]}
          onPress={() => {
            setIsAddGoalModalVisible(false);
            setNewGoalTitle('');
            setNewGoalDescription('');
          }}
        >
          {/* save/cancelbuttons */}
          <Text style={styles.modalButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.modalButton, styles.saveButton]}
          onPress={addGoal}
          disabled={!newGoalTitle.trim()}
        >
          <Text style={styles.modalButtonText}>Add Goal</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingTop: 50,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingBottom: 20,
  backgroundColor: '#0d0dd4',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
  },
  helpButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  date: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins',
  },
  accountInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0d0dd4',
  },
  accountInfoItem: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Poppins',
  },
  accountInfoLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  accountInfoValue: {
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 15,
  },
  passwordSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#555',
    fontFamily: 'Poppins',
  },
  profileDetails: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 18,
    fontFamily: 'Poppins',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontFamily: 'Poppins',
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e57373',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  logoutText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Poppins',
  },
  goalsSection: {
    width: '100%',
    marginTop: 30,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    marginBottom: 15,
    color: '#0d0dd4',
  },
  tabNav: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0d0dd4',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins',
  },
  activeTabText: {
    color: '#0d0dd4',
    fontWeight: 'bold',
  },
  daysContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 5,
  },
  daysCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins',
  },
  daysLabel: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Poppins',
  },
  tabContent: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins',
    marginBottom: 15,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  calorieCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#0d0dd4',
  },
  calorieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0d0dd4',
    fontFamily: 'Poppins',
  },
  calorieItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  calorieLabel: {
    fontSize: 14,
    color: '#444',
    fontFamily: 'Poppins',
  },
  statsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d0dd4',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#0d0dd4',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d0dd4',
    fontFamily: 'Poppins',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  calorieValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d0dd4',
    fontFamily: 'Poppins',
  },
  goalContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  goalText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins',
  },
  targetText: {
    fontSize: 14,
    color: '#0d0dd4',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    marginTop: 5,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    fontFamily: 'Poppins',
  },
  updateButton: {
    backgroundColor: '#0d0dd4',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#0d0dd4',
    fontFamily: 'Poppins',
  },
  inputGroup: {
    marginBottom: 15,
    zIndex: 1,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontFamily: 'Poppins',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
  },
  saveButton: {
    backgroundColor: '#0d0dd4',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  // Custom dropdown styles
  dropdownContainer: {
    position: 'relative',
    zIndex: 100,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginTop: 5,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownSelectedOption: {
    backgroundColor: '#f0f5ff',
  },
  dropdownOptionText: {
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  dropdownSelectedOptionText: {
    color: '#0d0dd4',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;