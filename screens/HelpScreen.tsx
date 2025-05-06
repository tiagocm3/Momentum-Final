import React, { useState } from 'react'; //importing React and useState to handle state changes
import {View,Text, StyleSheet,ScrollView,TouchableOpacity,Platform,
} from 'react-native'; //importing the necessary components from react-native for the UI
import { useNavigation } from '@react-navigation/native'; //hook to navigate between screens

//faq item interface definition, basically the structure of a faq item
interface FAQItem {
  question: string; //question 
  answer: string; //answer to the question
  isExpanded: boolean; //tracks if the answer is visible or hidden (when a user toggles it)
}
const HelpScreen = () => {
  const navigation = useNavigation(); //setting up navigation for going back
  //faqItems state holds all the faq data and their expanded states
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      question: 'How do I track a workout?',
      answer: 'Go to the Track tab at the bottom of the screen. Select workout type (strength or cardio), enter exercise details, and tap "Save Workout" when complete.',
      isExpanded: false,
    },
    {
      question: 'How do I log food?',
      answer: 'Go to the Track tab and select the "Nutrition" tab at the top. Search for a food item or use the "Manual Entry" option to log your meals.',
      isExpanded: false,
    },
    {
      question: 'How are my calorie goals calculated?',
      answer: 'Calorie goals are calculated using the Mifflin-St Jeor Equation based on your gender, weight, height, age, and activity level that you provide in your profile.',
      isExpanded: false,
    },
    {
      question: 'How do I add a goal?',
      answer: 'Go to the Profile tab, scroll down to "My Goals" section. Choose between Physical or Mental tabs, then tap "Add New Goal". Enter a title and optional description for your goal.',
      isExpanded: false,
    },
    {
      question: 'How do I update my profile information?',
      answer: 'Go to the Profile tab and tap "Update Physical Data". Here you can update your weight, height, age, gender, activity level, and calorie goal.',
      isExpanded: false,
    },
    {
      question: 'Can I delete workout or food logs?',
      answer: 'Yes, in both the workout and nutrition sections, each logged item has a "Delete" button that allows you to remove it from your history.',
      isExpanded: false,
    },
    {
      question: 'What is the "Days with Momentum" counter?',
      answer: 'This shows the number of days since you first logged into the Momentum app, tracking your journey towards better health and fitness.',
      isExpanded: false,
    },
    {
      question: 'How do I track mindfulness?',
      answer: 'Go to the Track tab and select the "Mindfulness" tab at the top. You can log your mood, sleep, stress levels, and meditation time.',
      isExpanded: false,
    },
  ]);
  //function to toggle the visibility of the FAQ answer when clicked
  const toggleFAQ = (index: number) => {
    const updatedFAQs = [...faqItems]; //make a copy of the current faqItems
    updatedFAQs[index].isExpanded = !updatedFAQs[index].isExpanded; //toggle the expanded state of the selected faq
    setFaqItems(updatedFAQs); //update the state with the new faqItems
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/*back button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()} //navigate back to the earlier screen (Profile)
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & FAQ</Text>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>
          Frequently Asked Questions
        </Text>
        {/* map through faqItems to display each faq */}
        {faqItems.map((item, index) => (
          <View 
            key={index} 
            style={styles.faqItem}
          >
            <TouchableOpacity 
              style={styles.questionContainer}
              onPress={() => toggleFAQ(index)} //toggle expanded state on click
            >
              <Text style={styles.question}>
                {item.question}
              </Text>
              <Text style={styles.expandIcon}>
                {/*show +/ - depending on expanded state*/}
                {item.isExpanded ? '−' : '+'}
              </Text>
            </TouchableOpacity>
            
            {/*only show answer if isExpanded is true */}
            {item.isExpanded && (
              <View style={styles.answerContainer}>
                <Text style={styles.answer}>
                  {item.answer}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

//css
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0dd4',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    fontFamily: 'Poppins',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    fontFamily: 'Poppins',
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: '#333',
    fontFamily: 'Poppins',
  },
  expandIcon: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0d0dd4',
    marginLeft: 10,
  },
  answerContainer: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  answer: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    fontFamily: 'Poppins',
  },
  supportSection: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  supportText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    color: '#666',
    fontFamily: 'Poppins',
  },
  contactButton: {
    backgroundColor: '#0d0dd4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
});

export default HelpScreen;