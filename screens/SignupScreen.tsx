import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';


//state variables to store user input and ui state
const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState(''); //username for login
  const [password, setPassword] = useState(''); //user's password
  const [firstName, setFirstName] = useState(''); //first name
  const [lastName, setLastName] = useState(''); //last name
  const [dateOfBirth, setDateOfBirth] = useState(new Date()); //dob
  const [email, setEmail] = useState(''); //email
  const [showDatePicker, setShowDatePicker] = useState(false); //controls viibility of date picker
  const [error, setError] = useState(''); //stores error messaging
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);  //tracks if user accepted health disclaimer

  //function that handles the signup process when form is submitted
  const handleSignUp = async () => {
    if (!disclaimerAccepted) { //check if user has accepted disclaimer
      setError('You must acknowledge and accept the disclaimer to continue.');
      return;
    }
    
    //make api call to django backend to create account
    const response = await fetch('http://127.0.0.1:8000/momentum/signup-api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth.toISOString().split('T')[0], //format date as yyyy,mm,dd
        email,
        disclaimer_accepted: disclaimerAccepted,
      }),
    });
  
    //wait for server response and parse json
    const data = await response.json();
  
    if (response.ok) {
    //if successful and a token is received, store it
      if (data.access) {
        await AsyncStorage.setItem('token', data.access);
      }
      //navigate to login screen when succesful
      navigation.navigate('Login');
    } else {
      //display error message
      setError(data.detail || data.error || 'error occurred, therefore please try again.');
      console.log('Signup error data ', data); 
    }
  };

  //display the full disclaimer in an alert modal
  const showDisclaimerAlert = () => {
    Alert.alert(
      "Mental Health Disclaimer",
      "Momentum was developed with ethical responsibility, user safety and legal compliance as a top priority. Your data is securely stored and used only for the functionality of this app.\n\nCONTENT WARNING: This application addresses sensitive topics such as body dysmorphia, eating disorders, and other mental health difficulties.\n\nIMPORTANT: Momentum is NEVER a substitute for professional medical advice, diagnosis, or treatment. If you're experiencing mental health issues, please consult with qualified healthcare professionals.\n\nBy continuing, you acknowledge that you understand these terms.",
      [
        {
          text: "Read Later", //option to dismiss without accepting
          onPress: () => console.log("Disclaimer read later"),
          style: "cancel"
        },
        { 
          text: "I Understand",  //option to accept the disclaimer
          onPress: () => setDisclaimerAccepted(true)
        }
      ]
    );
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(false); //close  date picker oncedate is selected
    setDateOfBirth(currentDate);
  };

  //user friendly date format
  const formattedDate = dateOfBirth.toLocaleDateString();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Sign Up</Text>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none" //stop the first letter from being a capital
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          {/*dob picker*/}
          <View style={styles.input}>
            <Button 
              onPress={() => setShowDatePicker(true)} 
              title={formattedDate ? `Date of Birth  ${formattedDate}` : "Please Select Date of Birth"} 
            />
            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>

          {/* disclaimer*/}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerTitle}>Mental Health Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              Momentum was developed with ethical responsibility, user safety and legal compliance as a top priority. Upon signing up, you acknowledge that you understand how your data is stored and used.
            </Text>
            <Text style={styles.disclaimerText}>
              This application addresses sensitive topics such as body dysmorphia, eating disorders, and mental health difficulties. Momentum is never, at any time, a substitute for professional medical advice.
            </Text>
            <View style={styles.disclaimerButtonContainer}>
              <Button 
                title={disclaimerAccepted ? "Disclaimer Accepted ✓" : "Read Full Disclaimer"} 
                onPress={showDisclaimerAlert}
                color={disclaimerAccepted ? "green" : "#2196F3"}
              />
            </View>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
          <Button title="Sign Up" onPress={handleSignUp} />

          {/*link to login*/}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Already have an account? Log In
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  link: {
    marginTop: 20,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  disclaimerContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  disclaimerButtonContainer: {
    marginTop: 10,
  }
});

export default SignUpScreen;