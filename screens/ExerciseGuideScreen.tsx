import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ExerciseGuideScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  //exercise explanations 
  const exerciseGuides = {
    //chest
    'Bench Press': {
      category: 'Chest',
      steps: [
        'Lie on a flat bench with your feet planted firmly on the ground',
        'Grip the barbell slightly wider than shoulder-width apart',
        'Unrack the bar and hold it directly above your chest with arms extended',
        'Lower the bar slowly to your mid-chest',
        'Press the bar back up to the starting position, fully extending your arms',
      ],
      tips: [
        'Keep your back slightly arched and shoulders retracted',
        'Keep your wrists straight and elbows at approximately 45° angle from your body',
        'Don\'t bounce the bar off your chest',
        'Maintain control throughout the movement',
      ],
      muscles: 'Primary: Pectoralis Major (chest). Secondary: Anterior Deltoids (front shoulders), Triceps',
    },
    'Incline Dumbbell Press': {
      category: 'Chest',
      steps: [
        'Set an incline bench to 30-45 degrees',
        'Sit on the bench with a dumbbell in each hand resting on your thighs',
        'Kick the weights up one at a time as you lie back',
        'Hold the dumbbells at shoulder width at chest level',
        'Press the dumbbells up until your arms are fully extended',
        'Lower the weights slowly back to the starting position',
      ],
      tips: [
        'Keep your back flat against the bench',
        'Don\'t arch your back excessively',
        'Control the weights throughout the full range of motion',
        'For better chest activation, maintain a neutral grip (palms facing forward)',
      ],
      muscles: 'Primary: Upper Pectoralis Major. Secondary: Anterior Deltoids, Triceps',
    },
    'Cable Fly': {
      category: 'Chest',
      steps: [
        'Position the pulleys at or above shoulder height',
        'Grasp a handle in each hand and step forward to the center between the cables',
        'Start with arms extended out to your sides, slight bend in the elbows',
        'Bring your hands together in front of your chest in an arcing motion',
        'Squeeze your chest at the peak contraction',
        'Slowly return to the starting position with controlled movement',
      ],
      tips: [
        'Maintain a slight bend in your elbows throughout',
        'Focus on using your chest muscles, not your arms',
        'Keep your chest up and shoulders back',
        'Experiment with different angles (high, mid, low) to target different parts of the chest',
      ],
      muscles: 'Primary: Pectoralis Major. Secondary: Anterior Deltoids',
    },

    //back
    'Lat Pulldown': {
      category: 'Back',
      steps: [
        'Sit at a lat pulldown machine with your knees secured under the pads',
        'Grasp the bar with a grip slightly wider than shoulder width',
        'Start with arms fully extended and shoulders slightly stretched upward',
        'Pull the bar down to your upper chest while squeezing your shoulder blades together',
        'Slowly return the bar to the starting position with controlled movement',
      ],
      tips: [
        'Keep your chest up and maintain a slight arch in your lower back',
        'Pull with your elbows, not your hands',
        'Avoid leaning back excessively to cheat the movement',
        'For lat emphasis, use a wider grip; for more mid-back engagement, use a closer grip',
      ],
      muscles: 'Primary: Latissimus Dorsi (lats). Secondary: Rhomboids, Biceps, Posterior Deltoids',
    },
    'Bent Over Rows': {
      category: 'Back',
      steps: [
        'Stand with feet shoulder-width apart, holding a barbell with an overhand grip',
        'Bend at the hips and knees, lowering your torso until almost parallel with the floor',
        'Keep your back straight and core engaged',
        'Pull the bar toward your lower ribcage, keeping elbows close to your body',
        'Squeeze your shoulder blades at the top of the movement',
        'Lower the bar with control to the starting position',
      ],
      tips: [
        'Maintain a neutral spine throughout the exercise',
        'Don\'t use momentum to swing the weight up',
        'Keep your neck aligned with your spine (don\'t look up)',
        'For better back activation, pull the weight to your belly button area',
      ],
      muscles: 'Primary: Latissimus Dorsi, Rhomboids, Trapezius. Secondary: Biceps, Rear Deltoids',
    },
    'Pull-ups': {
      category: 'Back',
      steps: [
        'Grip a pull-up bar with hands slightly wider than shoulder-width apart',
        'Hang with arms fully extended (dead hang)',
        'Pull yourself up by driving your elbows down and back',
        'Continue until your chin is over the bar',
        'Lower yourself with control to the starting position',
      ],
      tips: [
        'Avoid swinging or kipping (unless specifically doing CrossFit kipping pull-ups)',
        'Engage your core throughout the movement',
        'Focus on pulling with your back, not your arms',
        'If unable to perform full pull-ups, start with negatives or assisted pull-ups',
      ],
      muscles: 'Primary: Latissimus Dorsi. Secondary: Biceps, Forearms, Middle Trapezius, Rhomboids',
    },

    //legs
    'Squats': {
      category: 'Legs',
      steps: [
        'Stand with feet shoulder-width apart, toes slightly turned out',
        'For barbell squats, rest the bar on your traps/upper back (high bar) or rear delts (low bar)',
        'Brace your core and maintain a neutral spine',
        'Bend at the knees and hips, sitting back as if onto a chair',
        'Lower until thighs are at least parallel to the ground (or lower if mobility allows)',
        'Drive through your heels to return to the standing position',
      ],
      tips: [
        'Keep your chest up and back straight throughout the movement',
        'Ensure knees track in line with toes, not caving inward',
        'Maintain weight in mid-foot to heel, not toes',
        'Breathe in during descent, breathe out during ascent',
      ],
      muscles: 'Primary: Quadriceps, Glutes. Secondary: Hamstrings, Adductors, Lower Back, Core',
    },
    'Romanian Deadlift': {
      category: 'Legs',
      steps: [
        'Stand holding a barbell or dumbbells in front of your thighs',
        'Keep a slight bend in your knees throughout the exercise',
        'Hinge at the hips, pushing your buttocks back',
        'Lower the weight while keeping it close to your legs',
        'Continue until you feel a stretch in your hamstrings (typically when the weight is just below knee level)',
        'Drive hips forward to return to the starting position',
      ],
      tips: [
        'Keep your back flat and shoulders retracted',
        'Focus on hip hinge movement rather than squatting',
        'Maintain a neutral neck position aligned with your spine',
        'Control the weight throughout the movement - especially during the descent',
      ],
      muscles: 'Primary: Hamstrings, Glutes. Secondary: Lower Back, Forearms',
    },
    'Leg Press': {
      category: 'Legs',
      steps: [
        'Sit in the leg press machine with your back against the pad',
        'Place feet on the platform at shoulder-width apart',
        'Release the safety handles and lower the platform by bending your knees',
        'Lower until knees form approximately 90-degree angles',
        'Push through your heels to extend legs back to starting position',
        'Don\'t lock out knees completely at the top',
      ],
      tips: [
        'Keep your lower back pressed against the seat pad',
        'Don\'t let your knees cave inward during the movement',
        'Adjust foot position to target different muscles (higher = more hamstrings/glutes, lower = more quads)',
        'Control the weight especially during the descent',
      ],
      muscles: 'Primary: Quadriceps. Secondary: Glutes, Hamstrings',
    },

    //shoulder
    'Overhead Press': {
      category: 'Shoulders',
      steps: [
        'Stand with feet shoulder-width apart',
        'Hold a barbell at shoulder height with palms facing forward',
        'Brace your core and keep a neutral spine',
        'Press the weight directly overhead until arms are fully extended',
        'Lower the weight with control back to shoulder level',
      ],
      tips: [
        'Don\'t arch your lower back - engage your core for stability',
        'Keep your elbows slightly in front of the bar rather than directly under',
        'At the top position, your biceps should be by or slightly behind your ears',
        'For shoulder health, consider using dumbbells which allow a more natural range of motion',
      ],
      muscles: 'Primary: Deltoids (mainly anterior and lateral). Secondary: Triceps, Upper Chest, Trapezius',
    },
    'Lateral Raises': {
      category: 'Shoulders',
      steps: [
        'Stand holding dumbbells at your sides with palms facing in',
        'Keep a slight bend in your elbows throughout the movement',
        'Raise the weights out to the sides until arms are parallel to the floor',
        'Briefly hold at the top position',
        'Lower the weights slowly back to the starting position',
      ],
      tips: [
        'Don\'t use momentum to swing the weights up',
        'Keep wrists neutral (don\'t flex or extend)',
        'Lead with your elbows, not your hands',
        'For better isolation, think about pouring water from a pitcher when lifting',
      ],
      muscles: 'Primary: Lateral Deltoids. Secondary: Anterior Deltoids, Trapezius',
    },
    'Face Pulls': {
      category: 'Shoulders',
      steps: [
        'Set a cable pulley to upper chest/shoulder height',
        'Attach a rope handle and grip with both hands, palms facing each other',
        'Step back to create tension in the cable',
        'Pull the rope towards your face, separating your hands as you pull',
        'Focus on pulling your hands to either side of your face',
        'Squeeze your shoulder blades together at the end position',
        'Return to starting position with control',
      ],
      tips: [
        'Keep your upper arms parallel to the floor throughout',
        'Lead with your elbows, not your hands',
        'Rotate your hands so thumbs point behind you at end position',
        'Use lighter weight and focus on proper form for maximum benefit',
      ],
      muscles: 'Primary: Posterior Deltoids, Mid Trapezius, Rhomboids. Secondary: Rotator Cuff muscles',
    },

    //arms
    'Bicep Curls': {
      category: 'Arms',
      steps: [
        'Stand with feet shoulder-width apart, holding dumbbells or a barbell',
        'Keep elbows close to your sides and wrists straight',
        'Curl the weight upward by bending at the elbows',
        'Continue until forearms are vertical (or slightly beyond for peak contraction)',
        'Lower the weight slowly back to the starting position',
      ],
      tips: [
        'Avoid swinging your body to lift the weight',
        'Keep your upper arms stationary against your sides',
        'Squeeze the biceps at the top of the movement',
        'For maximum bicep activation, supinate your wrists (rotate so palms face shoulder) during the curl',
      ],
      muscles: 'Primary: Biceps Brachii. Secondary: Brachialis, Brachioradialis',
    },
    'Tricep Pushdowns': {
      category: 'Arms',
      steps: [
        'Stand facing a cable machine with a rope or bar attachment',
        'Grasp the attachment with hands shoulder-width apart',
        'Keep elbows tucked close to your sides',
        'Push the attachment down by extending your elbows',
        'Fully extend your arms and squeeze your triceps',
        'Slowly return to the starting position',
      ],
      tips: [
        'Keep your upper arms stationary throughout the movement',
        'Maintain an upright posture - don\'t lean forward excessively',
        'For rope attachment: spread the ends apart at the bottom for added contraction',
        'Focus on moving only at the elbow joint',
      ],
      muscles: 'Primary: Triceps (all three heads). Secondary: None significant',
    },
    'Skull Crushers': {
      category: 'Arms',
      steps: [
        'Lie on a bench holding a barbell or dumbbells with arms extended above chest',
        'Keep upper arms stationary, perpendicular to the floor',
        'Slowly bend elbows to lower the weight toward your forehead',
        'Stop just before the weight touches your forehead',
        'Extend elbows to return to starting position',
      ],
      tips: [
        'Keep wrists straight and firm throughout the movement',
        'Avoid flaring elbows outward - keep them pointing forward',
        'Use a controlled tempo, especially during the descent',
        'Consider using an EZ bar for reduced wrist strain',
      ],
      muscles: 'Primary: Triceps (particularly the long head). Secondary: None significant',
    },

    //core
    'Plank': {
      category: 'Core',
      steps: [
        'Start in a push-up position, then lower to rest on forearms',
        'Align elbows directly under shoulders',
        'Keep body in a straight line from head to heels',
        'Engage core by drawing navel toward spine',
        'Hold the position for the prescribed time',
      ],
      tips: [
        'Don\'t let hips sag or pike up',
        'Breathe normally throughout the hold',
        'Squeeze glutes and quads for additional stability',
        'For progression, try lifting one limb at a time while maintaining position',
      ],
      muscles: 'Primary: Rectus Abdominis, Transverse Abdominis. Secondary: Obliques, Lower Back, Shoulders',
    },
    'Russian Twists': {
      category: 'Core',
      steps: [
        'Sit on the floor with knees bent and feet elevated slightly',
        'Lean back to create approximately a 45-degree angle with the floor',
        'Clasp hands together or hold a weight in front of chest',
        'Rotate your torso to the right, touching hands/weight to the floor',
        'Rotate to the left side in the same manner',
        'Continue alternating sides',
      ],
      tips: [
        'Keep your back straight, not rounded',
        'Twist from your core, not your arms',
        'For increased difficulty, lift feet higher or add weight',
        'Exhale as you twist to each side',
      ],
      muscles: 'Primary: Obliques. Secondary: Rectus Abdominis, Hip Flexors',
    },
    'Hanging Leg Raises': {
      category: 'Core',
      steps: [
        'Hang from a pull-up bar with hands slightly wider than shoulder-width',
        'Keep your shoulders engaged (not fully relaxed)',
        'Keeping legs straight, raise them by flexing at the hips',
        'Lift until legs are parallel to the ground (or higher if possible)',
        'Lower legs slowly with control',
      ],
      tips: [
        'Avoid swinging or using momentum',
        'For easier variation, bend knees during the movement',
        'For advanced variation, raise legs all the way until toes touch the bar',
        'Focus on using abdominals, not hip flexors',
      ],
      muscles: 'Primary: Lower Abdominals, Hip Flexors. Secondary: Grip, Forearms',
    },

    //yoga and flexibility
    'Sun Salutation': {
      category: 'Recovery',
      steps: [
        'Begin standing with feet together, hands in prayer position',
        'Inhale, raise arms overhead, gently arch back',
        'Exhale, bend forward, bringing hands to floor beside feet',
        'Inhale, step or jump back to plank position',
        'Exhale, lower to floor (knees, chest, chin or chaturanga)',
        'Inhale, lift chest into upward facing dog or cobra',
        'Exhale, lift hips to downward facing dog, hold for five breaths',
        'Inhale, step or jump feet between hands',
        'Exhale, fold forward',
        'Inhale, rise up with arms overhead',
        'Exhale, return to starting position',
      ],
      tips: [
        'Coordinate breath with movement throughout the sequence',
        'Move at your own pace, especially when learning',
        'Modify positions as needed for your flexibility level',
        'Focus on alignment rather than depth in each position',
      ],
      muscles: 'Full body engagement with emphasis on core stability, hamstring flexibility, and shoulder strength',
    },
    'Foam Rolling': {
      category: 'Recovery',
      steps: [
        'Position the foam roller under the muscle group you want to target',
        'Support some of your body weight with your arms or unaffected leg',
        'Slowly roll along the muscle for 30-60 seconds',
        'When you find a particularly tender spot, pause and hold for 20-30 seconds',
        'Continue rolling, covering the entire muscle',
        'Breathe deeply throughout the process',
      ],
      tips: [
        'Start with a softer roller if you are new to foam rolling',
        'Control the pressure by adjusting how much weight you put on the roller',
        'Never roll directly on a joint or bone',
        'For IT band, roll the quadriceps and glutes instead of directly on the IT band',
      ],
      muscles: 'Targets whatever muscle group is being rolled - commonly used for quads, hamstrings, glutes, back, calves',
    }
  };
  //filter exercises by search query
const filteredExercises = Object.entries(exerciseGuides)
// keep exercises where the name includes the search text
.filter(([name]) => 
  name.toLowerCase().includes(searchQuery.toLowerCase())
)
//then filter by selected category (if not 'All')
.filter(([, details]) => 
  selectedCategory === 'All' || details.category === selectedCategory
);
//create a list of unique categories beginning with 'All'
const categories = ['All', ...new Set(Object.values(exerciseGuides).map(exercise => exercise.category))];
return (
//safe area to avoid notches and edges on phones
<SafeAreaView style={styles.container}>

  <View style={styles.header}>
    {/* top header with screen title and back button */}
    <Text style={styles.title}>Exercise Guide</Text>
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      <Text style={styles.backButtonText}>Back</Text>
    </TouchableOpacity>
  </View>

  <View style={styles.searchContainer}>
    {/*search bar where user types exercise name */}
    <TextInput
      style={styles.searchInput}
      placeholder="Search exercises..."
      value={searchQuery}
      onChangeText={setSearchQuery} // updates state when typing
    />
  </View>

  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
    {/*scrollable row of category buttons (e.g., Chest, Legs, Arms) */}
    {categories.map(category => (
      <TouchableOpacity 
        key={category}
        style={[
          styles.categoryButton,
          selectedCategory === category && styles.categoryButtonActive // apply active style if selected
        ]}
        onPress={() => setSelectedCategory(category)} // change selected category
      >
        <Text 
          style={[
            styles.categoryButtonText,
            selectedCategory === category && styles.categoryButtonTextActive // active text style
          ]}
        >
          {category}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>

  <ScrollView style={styles.exerciseList}>
    {/*list of exercises based on search + selected category */}
    {filteredExercises.length > 0 ? (
      //if there are matches, show each exercise
      filteredExercises.map(([name, details]) => (
        <View key={name} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{name}</Text>
          <Text style={styles.exerciseCategory}>{details.category}</Text>

          {/*how to do each exercise */}
          <Text style={styles.sectionTitle}>How To Perform:</Text>
          {details.steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          {/*extra tips to rememebr */}
          <Text style={styles.sectionTitle}>Tips:</Text>
          {details.tips.map((tip, index) => (
            <View key={index} style={styles.tipContainer}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}

          {/*muscles targeted by the exercise */}
          <Text style={styles.sectionTitle}>Muscles Worked:</Text>
          <Text style={styles.musclesText}>{details.muscles}</Text>
        </View>
      ))
    ) : (
      //if no matches are found this message is shwon
      <View style={styles.noResultsContainer}>
        <Text style={styles.noResultsText}>No exercises found matching your search.</Text>
      </View>
    )}
  </ScrollView>

</SafeAreaView>

);
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f4f4f4',
      paddingBottom: 70,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#0d0dd4',
    },
    backButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: '#0d0dd4',
    },
    backButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    searchInput: {
      backgroundColor: '#f0f0f0',
      borderRadius: 20,
      padding: 10,
      fontSize: 16,
    },
    categoryScroll: {
      backgroundColor: '#fff',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginHorizontal: 5,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
      alignSelf: 'flex-start', 
      height: 'auto',
    },
    categoryButtonActive: {
      backgroundColor: '#0d0dd4',
    },
    categoryButtonText: {
      fontSize: 14,
      color: '#555',
    },
    categoryButtonTextActive: {
      color: '#fff',
      fontWeight: '600',
    },
    exerciseList: {
      flex: 1,
      padding: 15,
    },
    exerciseCard: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 1,
    },
    exerciseName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 4,
    },
    exerciseCategory: {
        fontSize: 14,
        color: '#0d0dd4',
        fontWeight: '500',
        marginBottom: 0,
      },
      sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginTop: 0,
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 2,
      },
    stepContainer: {
      flexDirection: 'row',
      marginBottom: 8,
      paddingRight: 5,
    },
    stepNumber: {
      width: 20,
      fontWeight: 'bold',
      color: '#0d0dd4',
    },
    stepText: {
      flex: 1,
      color: '#333',
    },
    tipContainer: {
      flexDirection: 'row',
      marginBottom: 6,
      paddingRight: 5,
    },
    tipBullet: {
      width: 15,
      fontWeight: 'bold',
      color: '#0d0dd4',
    },
    tipText: {
      flex: 1,
      color: '#333',
    },
    musclesText: {
      color: '#555',
      lineHeight: 20,
      fontStyle: 'italic',
    },
    noResultsContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noResultsText: {
      fontSize: 16,
      color: '#888',
      textAlign: 'center',
    },
  });
  
  export default ExerciseGuideScreen;