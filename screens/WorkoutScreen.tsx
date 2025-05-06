import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WorkoutScreen = () => {
  const navigation = useNavigation();
  const [expandedWorkout, setExpandedWorkout] = useState(null);

  //workout library
  const workouts = [
    {
      id: 'fullbody',
      name: 'Full Body Workout',
      description: 'Complete workout targeting all major muscle groups',
      exercises: [
        {
          category: 'Chest',
          exercises: [
            {
              name: 'Bench Press',
              sets: 4,
              reps: '8-10',
              alternatives: ['Dumbbell Press', 'Push-ups']
            },
            {
              name: 'Incline Dumbbell Press',
              sets: 3,
              reps: '10-12',
              alternatives: ['Incline Bench Press', 'Cable Fly']
            }
          ]
        },
        {
          category: 'Back',
          exercises: [
            {
              name: 'Lat Pulldown',
              sets: 4,
              reps: '10-12',
              alternatives: ['Pull-ups', 'Band Pulldowns']
            },
            {
              name: 'Bent Over Rows',
              sets: 3,
              reps: '8-10',
              alternatives: ['T-Bar Rows', 'Seated Cable Rows']
            }
          ]
        },
        {
          category: 'Legs',
          exercises: [
            {
              name: 'Squats',
              sets: 4,
              reps: '8-10',
              alternatives: ['Leg Press', 'Goblet Squats']
            },
            {
              name: 'Romanian Deadlift',
              sets: 3,
              reps: '10-12',
              alternatives: ['Leg Curls', 'Good Mornings']
            }
          ]
        },
        {
          category: 'Shoulders',
          exercises: [
            {
              name: 'Overhead Press',
              sets: 3,
              reps: '8-10',
              alternatives: ['Dumbbell Shoulder Press', 'Arnold Press']
            },
            {
              name: 'Lateral Raises',
              sets: 3,
              reps: '12-15',
              alternatives: ['Cable Lateral Raises', 'Upright Rows']
            }
          ]
        },
        {
          category: 'Arms',
          exercises: [
            {
              name: 'Bicep Curls',
              sets: 3,
              reps: '10-12',
              alternatives: ['Hammer Curls', 'Preacher Curls']
            },
            {
              name: 'Tricep Pushdowns',
              sets: 3,
              reps: '10-12',
              alternatives: ['Skull Crushers', 'Overhead Tricep Extensions']
            }
          ]
        },
        {
          category: 'Core',
          exercises: [
            {
              name: 'Plank',
              sets: 3,
              reps: '30-60 sec',
              alternatives: ['Mountain Climbers', 'Ab Rollouts']
            },
            {
              name: 'Russian Twists',
              sets: 3,
              reps: '15 each side',
              alternatives: ['Bicycle Crunches', 'Side Planks']
            }
          ]
        }
      ]
    },
    {
      id: 'upperbody',
      name: 'Upper Body Strength',
      description: 'Focus on chest, back, shoulders and arms',
      exercises: [
        {
          category: 'Chest (Push)',
          exercises: [
            {
              name: 'Barbell Bench Press',
              sets: 5,
              reps: '5-8',
              alternatives: ['Dumbbell Bench Press', 'Machine Chest Press']
            },
            {
              name: 'Incline Bench Press',
              sets: 4,
              reps: '8-10',
              alternatives: ['Incline Dumbbell Press', 'Landmine Press']
            },
            {
              name: 'Cable Flyes',
              sets: 3,
              reps: '12-15',
              alternatives: ['Dumbbell Flyes', 'Pec Deck Machine']
            }
          ]
        },
        {
          category: 'Back (Pull)',
          exercises: [
            {
              name: 'Barbell Rows',
              sets: 4,
              reps: '8-10',
              alternatives: ['Dumbbell Rows', 'Meadows Rows']
            },
            {
              name: 'Pull-ups',
              sets: 4,
              reps: '6-10',
              alternatives: ['Lat Pulldowns', 'Assisted Pull-ups']
            },
            {
              name: 'Face Pulls',
              sets: 3,
              reps: '12-15',
              alternatives: ['Reverse Flyes', 'Band Pull-aparts']
            }
          ]
        },
        {
          category: 'Shoulders',
          exercises: [
            {
              name: 'Overhead Press',
              sets: 4,
              reps: '6-8',
              alternatives: ['Push Press', 'Seated Dumbbell Press']
            },
            {
              name: 'Lateral Raises',
              sets: 3,
              reps: '12-15',
              alternatives: ['Cable Lateral Raises', 'Leaning Lateral Raises']
            },
            {
              name: 'Rear Delt Flyes',
              sets: 3,
              reps: '12-15',
              alternatives: ['Reverse Pec Deck', 'Bent Over Lateral Raises']
            }
          ]
        },
        {
          category: 'Biceps',
          exercises: [
            {
              name: 'Barbell Curls',
              sets: 3,
              reps: '8-12',
              alternatives: ['EZ Bar Curls', 'Cable Curls']
            },
            {
              name: 'Hammer Curls',
              sets: 3,
              reps: '10-12',
              alternatives: ['Cross Body Curls', 'Reverse Curls']
            }
          ]
        },
        {
          category: 'Triceps',
          exercises: [
            {
              name: 'Close Grip Bench Press',
              sets: 3,
              reps: '8-10',
              alternatives: ['Diamond Push-ups', 'JM Press']
            },
            {
              name: 'Tricep Rope Pushdowns',
              sets: 3,
              reps: '10-12',
              alternatives: ['V-Bar Pushdowns', 'Overhead Tricep Extensions']
            }
          ]
        }
      ]
    },
    {
      id: 'legday',
      name: 'Leg Day Routine',
      description: 'Complete lower body training routine',
      exercises: [
        {
          category: 'Quadriceps',
          exercises: [
            {
              name: 'Barbell Back Squats',
              sets: 5,
              reps: '5-8',
              alternatives: ['Front Squats', 'Hack Squats']
            },
            {
              name: 'Leg Press',
              sets: 4,
              reps: '8-12',
              alternatives: ['Smith Machine Squats', 'Belt Squats']
            },
            {
              name: 'Leg Extensions',
              sets: 3,
              reps: '12-15',
              alternatives: ['Sissy Squats', 'Spanish Squats']
            }
          ]
        },
        {
          category: 'Hamstrings',
          exercises: [
            {
              name: 'Romanian Deadlifts',
              sets: 4,
              reps: '8-10',
              alternatives: ['Stiff-Legged Deadlifts', 'Good Mornings']
            },
            {
              name: 'Lying Leg Curls',
              sets: 3,
              reps: '10-12',
              alternatives: ['Seated Leg Curls', 'Nordic Hamstring Curls']
            },
            {
              name: 'Glute Ham Raises',
              sets: 3,
              reps: '8-12',
              alternatives: ['Swiss Ball Leg Curls', 'Cable Pull-throughs']
            }
          ]
        },
        {
          category: 'Glutes',
          exercises: [
            {
              name: 'Hip Thrusts',
              sets: 4,
              reps: '8-12',
              alternatives: ['Glute Bridges', 'Frog Pumps']
            },
            {
              name: 'Bulgarian Split Squats',
              sets: 3,
              reps: '10-12 each leg',
              alternatives: ['Lunges', 'Step-ups']
            }
          ]
        },
        {
          category: 'Calves',
          exercises: [
            {
              name: 'Standing Calf Raises',
              sets: 4,
              reps: '12-15',
              alternatives: ['Smith Machine Calf Raises', 'Donkey Calf Raises']
            },
            {
              name: 'Seated Calf Raises',
              sets: 3,
              reps: '15-20',
              alternatives: ['Single Leg Calf Raises', 'Leg Press Calf Raises']
            }
          ]
        },
        {
          category: 'Core Stability',
          exercises: [
            {
              name: 'Weighted Planks',
              sets: 3,
              reps: '30-45 sec',
              alternatives: ['Ab Wheel Rollouts', 'TRX Fallouts']
            },
            {
              name: 'Hanging Leg Raises',
              sets: 3,
              reps: '10-15',
              alternatives: ['Captains Chair Leg Raises', 'Reverse Crunches']
            }
          ]
        }
      ]
    },

{
    id: 'splits',
    name: 'Training Splits',
    description: 'Popular workout splits used by bodybuilders and fitness enthusiasts',
    exercises: [
      {
        category: 'Arnold Split',
        exercises: [
          {
            name: 'Day 1: Chest & Back',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Bench Press', 'Incline Press', 'Pullups', 'Rows', 'Flyes', 'Pullovers']
          },
          {
            name: 'Day 2: Shoulders & Arms',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Military Press', 'Lateral Raises', 'Bicep Curls', 'Tricep Extensions']
          },
          {
            name: 'Day 3: Legs & Lower Back',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Squats', 'Deadlifts', 'Leg Extensions', 'Leg Curls', 'Calf Raises']
          },
          {
            name: 'Day 4: Chest & Back (Repeat)',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Focus on different exercises or rep ranges than Day 1']
          },
          {
            name: 'Day 5: Shoulders & Arms (Repeat)',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Focus on different exercises or rep ranges than Day 2']
          },
          {
            name: 'Day 6: Legs & Lower Back (Repeat)',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Focus on different exercises or rep ranges than Day 3']
          }
        ]
      },
      {
        category: 'Bro Split',
        exercises: [
          {
            name: 'Day 1: Chest',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Bench Press', 'Incline Press', 'Decline Press', 'Flyes', 'Push-ups']
          },
          {
            name: 'Day 2: Back',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Pull-ups', 'Rows', 'Lat Pulldowns', 'Deadlifts', 'Shrugs']
          },
          {
            name: 'Day 3: Shoulders',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Flyes']
          },
          {
            name: 'Day 4: Arms',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Bicep Curls', 'Tricep Extensions', 'Hammer Curls', 'Skull Crushers']
          },
          {
            name: 'Day 5: Legs',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Squats', 'Leg Press', 'Leg Extensions', 'Leg Curls', 'Calf Raises']
          }
        ]
      },
      {
        category: 'Push/Pull/Legs',
        exercises: [
          {
            name: 'Day 1: Push (Chest, Shoulders, Triceps)',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Bench Press', 'Overhead Press', 'Dips', 'Incline Press', 'Lateral Raises', 'Tricep Extensions']
          },
          {
            name: 'Day 2: Pull (Back, Biceps)',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Pull-ups', 'Rows', 'Lat Pulldowns', 'Face Pulls', 'Bicep Curls', 'Hammer Curls']
          },
          {
            name: 'Day 3: Legs (Quads, Hamstrings, Calves)',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Squats', 'Deadlifts', 'Leg Press', 'Lunges', 'Leg Curls', 'Calf Raises']
          },
          {
            name: 'Day 4: Rest or Repeat Cycle',
            sets: 'N/A',
            reps: 'N/A',
            alternatives: ['Active Recovery', 'Mobility Work']
          }
        ]
      },
      {
        category: 'Upper/Lower',
        exercises: [
          {
            name: 'Day 1: Upper Body',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Bench Press', 'Rows', 'Overhead Press', 'Pull-ups/Pulldowns', 'Flyes', 'Arm Work']
          },
          {
            name: 'Day 2: Lower Body',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Squats', 'Deadlifts', 'Leg Press', 'Lunges', 'Leg Curls', 'Calf Work']
          },
          {
            name: 'Day 3: Rest',
            sets: 'N/A',
            reps: 'N/A',
            alternatives: ['Active Recovery', 'Mobility Work']
          },
          {
            name: 'Day 4: Upper Body',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Different exercises or rep ranges than Day 1']
          },
          {
            name: 'Day 5: Lower Body',
            sets: 'Multiple',
            reps: 'Various',
            alternatives: ['Different exercises or rep ranges than Day 2']
          }
        ]
      }
    ]
  },
  {
    id: 'recovery',
    name: 'Mindful Movement',
    description: 'Yoga, flexibility, and recovery exercises for improved mobility and relaxation',
    exercises: [
      {
        category: 'Yoga Flows',
        exercises: [
          {
            name: 'Sun Salutation (Surya Namaskar)',
            sets: '5-10',
            reps: 'Flow sequences',
            alternatives: ['Modified Sun Salutation', 'Moon Salutation']
          },
          {
            name: 'Vinyasa Flow',
            sets: '1',
            reps: '15-30 min',
            alternatives: ['Slow Flow', 'Power Yoga']
          },
          {
            name: 'Restorative Yoga',
            sets: '1',
            reps: '30-45 min',
            alternatives: ['Yin Yoga', 'Gentle Yoga']
          }
        ]
      },
      {
        category: 'Flexibility Routines',
        exercises: [
          {
            name: 'Full Body Stretching Routine',
            sets: '1',
            reps: '15-20 min',
            alternatives: ['PNF Stretching', 'Dynamic Stretching']
          },
          {
            name: 'Hip Opener Sequence',
            sets: '1',
            reps: '10-15 min',
            alternatives: ['Pigeon Pose Variations', 'Butterfly Stretch Progression']
          },
          {
            name: 'Shoulder & Chest Mobility',
            sets: '1',
            reps: '10-15 min',
            alternatives: ['Wall Slides', 'Banded Dislocations', 'Thread the Needle']
          }
        ]
      },
      {
        category: 'Recovery Techniques',
        exercises: [
          {
            name: 'Foam Rolling Session',
            sets: '1',
            reps: '10-15 min',
            alternatives: ['Lacrosse Ball Work', 'Massage Stick']
          },
          {
            name: 'Breathing Exercises',
            sets: '3-5',
            reps: '1-2 min each',
            alternatives: ['Box Breathing', 'Diaphragmatic Breathing', '4-7-8 Technique']
          },
          {
            name: 'Contrast Therapy',
            sets: '1',
            reps: '15-20 min',
            alternatives: ['Hot/Cold Shower', 'Ice Bath & Sauna']
          }
        ]
      },
      {
        category: 'Mobility Work',
        exercises: [
          {
            name: 'Animal Flow Sequence',
            sets: '1',
            reps: '10-15 min',
            alternatives: ['Bear Crawls', 'Crab Walks', 'Lizard Crawls']
          },
          {
            name: 'Joint Mobility Routine',
            sets: '1',
            reps: '10 min',
            alternatives: ['CARs (Controlled Articular Rotations)', 'Functional Range Conditioning']
          },
          {
            name: 'Movement Prep',
            sets: '1',
            reps: '5-10 min',
            alternatives: ['Dynamic Warm-up', 'RAMP Protocol']
          }
        ]
      }
    ]
  }
    
  ];

  //handles toggling which workout is expanded
  const toggleWorkout = (id) => {
    if (expandedWorkout === id) {
      setExpandedWorkout(null); //if already open, collapse it
    } else {
      setExpandedWorkout(id); //otherwise, expand it
    }
  };

  //shows details for a single exercise
  const renderExerciseDetails = (exercise) => {
    return (
      <View style={styles.exerciseItem} key={exercise.name}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseDetail}>{exercise.sets} sets × {exercise.reps}</Text>
        <Text style={styles.exerciseDetail}>
          <Text style={styles.alternativesLabel}>Alternatives: </Text>
          {exercise.alternatives.join(', ')}
        </Text>
      </View>
    );
  };

  //shows the full workout info if it's expanded
  const renderWorkoutDetails = (workout) => {
    if (expandedWorkout !== workout.id) return null; //don't show anything unless it's the selected one

    return (
      <View style={styles.workoutDetails}>
        <Text style={styles.workoutDescription}>{workout.description}</Text>
        {workout.exercises.map((category, index) => (
          <View key={index} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category.category}</Text>
            {category.exercises.map(renderExerciseDetails)}
          </View>
        ))}
      </View>
    );
  };

  //this is what gets rendered on the screen
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Workout Plans</Text>
        <Text style={styles.subtitle}>Choose your workout routine</Text>

        {/* show all workout cards */}
        {workouts.map((workout) => (
          <View key={workout.id} style={styles.workoutSection}>
            <TouchableOpacity 
              style={[
                styles.workoutCard,
                expandedWorkout === workout.id && styles.workoutCardActive
              ]}
              onPress={() => toggleWorkout(workout.id)}
            >
              <Text style={styles.workoutText}>{workout.name}</Text>
              <Text style={styles.tapText}>
                {expandedWorkout === workout.id ? 'Tap to collapse' : 'Tap for more details'}
              </Text>
            </TouchableOpacity>
            {/*quick nav to exercise page */}
        
            {/*show workout details if it's expanded*/}
            {renderWorkoutDetails(workout)}
          </View>
        ))}
        <TouchableOpacity
        style={styles.howToButton}
        onPress={() => navigation.navigate('Exercise')} ><Text style={styles.howToButtonText}>How To</Text>
        </TouchableOpacity>

        {/*button to go back to home*/}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d0dd4',
    marginBottom: 10,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  workoutSection: {
    width: '100%',
    marginBottom: 15,
  },
  workoutCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  workoutCardActive: {
    backgroundColor: '#e6e6ff',
    borderColor: '#0d0dd4',
    borderWidth: 1,
  },
  workoutText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  tapText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  workoutDetails: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  categoryContainer: {
    marginBottom: 15,
  },
  howToButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  howToButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d0dd4',
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exerciseItem: {
    marginBottom: 12,
    paddingLeft: 10,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  exerciseDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  alternativesLabel: {
    fontWeight: '500',
    color: '#555',
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#0d0dd4',
    padding: 12,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default WorkoutScreen;