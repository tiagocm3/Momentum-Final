import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const MentalHealthFitnessAdvice = () => {
  const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0];
  //collection of mental health focused fitness advice
  const adviceList = [
    "Exercise is not about punishment, but celebrating what your body can do.",
    "Listen to your body - rest days are just as important as active ones.",
    "Moving your body for 5 minutes is better than not moving at all.",
    "Focus on how exercise makes you feel, not just how you look.",
    "Mindful movement can reduce anxiety and boost your mood.",
    "It's okay to modify exercises to fit your needs and energy level today.",
    "Celebrate small wins in your fitness journey.",
    "Your worth is not determined by your workout streak.",
    "The best exercise is the one you enjoy and will stick with.",
    "Be gentle with yourself on low-energy days.",
    "Movement is self-care, not self-punishment.",
    "Mental health benefits from exercise happen before any physical changes.",
    "Focus on adding healthy habits, not restricting yourself.",
    "A short walk can help clear your mind and reduce stress.",
    "Your body deserves kindness, regardless of its shape or capabilities."
  ];

  //function to fade advice out and in
  const fadeOutAndIn = () => {
    Animated.sequence([
      //fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      //fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  //cange advice every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fadeOutAndIn();
      
      //wait until fade out is complete to then change the text
      setTimeout(() => {
        setCurrentAdviceIndex(prevIndex => 
          prevIndex === adviceList.length - 1 ? 0 : prevIndex + 1
        );
      }, 1000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mindful Movement Tip</Text>
      <Animated.View style={[styles.adviceContainer, { opacity: fadeAnim }]}>
        <Text style={styles.adviceText}>{adviceList[currentAdviceIndex]}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 20,
    marginTop: 5,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins',
    marginBottom: 10,
    textAlign: 'center',
  },
  adviceContainer: {
    minHeight: 70,
    justifyContent: 'center',
  },
  adviceText: {
    fontSize: 16,
    color: '#0d0dd4',
    fontFamily: 'Poppins',
    textAlign: 'center',
    lineHeight: 22,
  }
});
export default MentalHealthFitnessAdvice;