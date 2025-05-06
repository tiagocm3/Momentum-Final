import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, StatusBar, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Animated, Easing } from 'react-native';

//breathing exercise component
const BreathingExercise = ({ onClose }) => {
  //track phase (inhale, hold, exhale)
  const [phase, setPhase] = useState('inhale');
  //count how many cycles have been done
  const [count, setCount] = useState(0);
  //animated value for breathing effect
  const animation = useRef(new Animated.Value(0)).current;
  //flag to show when done
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    //start when component mounts
    startBreathing();
    //stop if component unmounts
    return () => {
      //stop animation
      animation.stopAnimation();
    };
  }, []);

  const startBreathing = () => {
    //this function handles one full breath cycle
    const breathSequence = () => {
      //inhale animation
      setPhase('inhale');
      Animated.timing(animation, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.quad)
      }).start(({ finished }) => {
        if (finished) {
          //hold animation
          setPhase('hold');
          setTimeout(() => {
            //exhale animation
            setPhase('exhale');
            Animated.timing(animation, {
              toValue: 0,
              duration: 6000,
              useNativeDriver: false,
              easing: Easing.inOut(Easing.quad)
            }).start(({ finished }) => {
              if (finished) {
                setCount(prevCount => {
                  const newCount = prevCount + 1;
                  if (newCount < 5) {
                    setTimeout(breathSequence, 1000);
                    return newCount;
                  } else {
                    setCompleted(true);
                    return newCount;
                  }
                });
              }
            });
          }, 2000); //hold for 2 seconds
        }
      });
    };
    //kick off the first cycle
    breathSequence();
  };
  //animate the circle size
  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3]
  });

  //animate the background color too
  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(52, 152, 219, 0.5)', 'rgba(52, 152, 219, 0.8)']
  });

  //instructions during the extercose
  const getInstructionText = () => {
    switch(phase) {
      case 'inhale': return 'Breathe in...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe out...';
      default: return 'Breathe in...';
    }
  };

  //function to handle close button
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      console.warn('onClose prop is not a function');
    }
  };

  return (
    <View style={breathingStyles.container}>
      <TouchableOpacity 
        style={breathingStyles.closeButton} 
        onPress={handleClose}
        activeOpacity={0.7}
      >
        <Icon name="close" size={20} color="#777" />
      </TouchableOpacity>
      
      {/*header text*/}
      <Text style={breathingStyles.title}>Breathing Exercise</Text>
      <Text style={breathingStyles.subtitle}>Take a moment to calm your mind and relax</Text>
      
      {/*animated circle and instructions*/}
      <View style={breathingStyles.circleContainer}>
        <Animated.View
          style={[
            breathingStyles.breathCircle,
            {
              transform: [{ scale }],
              backgroundColor: backgroundColor
            }
          ]}
        />
        <Text style={breathingStyles.instructionText}>{getInstructionText()}</Text>
        <Text style={breathingStyles.countText}>
          {completed ? "Complete!" : `Breath ${count + 1} of 5`}
        </Text>
      </View>
      
      {/*short explanation*/}
      <Text style={breathingStyles.benefitText}>
        Deep breathing activates your parasympathetic nervous system,
        reducing stress and promoting relaxation.
      </Text>
      
      {completed && (
        <TouchableOpacity
          style={breathingStyles.doneButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Text style={breathingStyles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

//education screen main component
const EducationScreen = () => {

  //for screen navigation
  const navigation = useNavigation();

  //control if modal is showing
  const [modalVisible, setModalVisible] = useState(false);

  //which category is clicked
  const [selectedCategory, setSelectedCategory] = useState(null);

  //mood rating from user 
  const [moodRating, setMoodRating] = useState(null);

  //show mood prompt
  const [showMoodPrompt, setShowMoodPrompt] = useState(true);

  //daily message
  const [showDailyAffirmation, setShowDailyAffirmation] = useState(true);

  //previous moods
  const [moodHistory, setMoodHistory] = useState([]);

  //breathing popup
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);

  //mental health tips that appear randomly
  const mentalHealthTips = [
    "Remember that rest and recovery are essential parts of your fitness journey.",
    "Progress isn't always linear - celebrate small wins and be patient with yourself.",
    "Listen to your body. It's okay to modify workouts based on how you feel today.",
    "Your worth isn't tied to your fitness level or appearance.",
    "Movement can be joyful - choose activities that make you happy.",
    "Self-compassion leads to better long-term results than harsh self-criticism.",
    "Setting boundaries around your health routine is a form of self-care.",
    "A 10-minute walk outdoors can significantly improve your mood.",
    "Deep breathing for just 2 minutes can reduce stress hormones in your body."
  ];

  //daily affirmations for mental wellness
  const affirmations = [
    "I honor my body by giving it the movement and rest it needs.",
    "I am getting stronger every day - physically and mentally.",
    "I choose to focus on how exercise makes me feel, not just how I look.",
    "My worth is not measured by my performance or appearance.",
    "I celebrate my body for what it can do, not how it appears.",
    "I am patient with myself as I learn and grow.",
    "I trust my journey and embrace progress at my own pace.",
    "I am building a healthier relationship with fitness and my body."
  ];

  //random tip and affirmation selection
  const randomTip = mentalHealthTips[Math.floor(Math.random() * mentalHealthTips.length)];
  const dailyAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

  //education content for each category
  const categories = [
    {
      id: 'mental',
      title: 'Mental Wellness',
      icon: 'meditation',
      color: '#9b59b6',
      gradient: ['#9b59b6', '#8e44ad'],
      subcategories: [
        {
          title: 'Mindfulness & Exercise',
          articles: [
            {
              title: 'The Mind-Body Connection in Fitness',
              preview: 'How mindful movement improves both mental and physical health.',
              readTime: '6 min read',
              tags: ['beginner-friendly', 'mindfulness']
            },
            {
              title: 'Exercise as Medicine for Depression',
              preview: 'Research-backed approaches to mental wellness through movement.',
              readTime: '9 min read',
              tags: ['evidence-based', 'mental health']
            }
          ],
          facts: [
            'Even 5 minutes of movement can trigger mood-enhancing endorphins.',
            'Regular exercise increases BDNF, a protein that improves brain health and mood stability.'
          ]
        },
        {
          title: 'Self-Compassion in Fitness',
          articles: [
            {
              title: 'Breaking Free from Fitness Perfectionism',
              preview: 'How to set goals that support mental health rather than harm it.',
              readTime: '7 min read',
              tags: ['body image', 'self-compassion']
            },
            {
              title: 'The Language of Self-Talk During Exercise',
              preview: 'Transforming how you speak to yourself during challenges.',
              readTime: '5 min read',
              tags: ['mindset', 'beginner-friendly']
            }
          ],
          facts: [
            'Self-compassionate individuals are more likely to maintain consistent exercise habits.',
            'Harsh self-criticism activates the same stress response as external threats.'
          ]
        },
        {
          title: 'Stress Management',
          articles: [
            {
              title: 'Breathwork Techniques for Immediate Calm',
              preview: 'Simple breathing exercises to reduce stress and anxiety.',
              readTime: '5 min read',
              tags: ['quick practice', 'stress relief']
            },
            {
              title: 'Movement as Meditation',
              preview: 'Finding flow state and mental clarity through physical activity.',
              readTime: '6 min read',
              tags: ['mindfulness', 'meditation']
            }
          ],
          facts: [
            'Box breathing (4-4-4-4 pattern) is used by Navy SEALs to manage acute stress.',
            'Regular physical activity can reduce anxiety sensitivity by 25%.'
          ]
        }
      ]
    },
    {
      id: 'cardio',
      title: 'Cardio',
      icon: 'heart-pulse',
      color: '#e74c3c',
      gradient: ['#e74c3c', '#c0392b'],
      subcategories: [
        {
          title: 'Running',
          articles: [
            {
              title: 'Mindful Running: Beyond the Miles',
              preview: 'How to turn your run into a moving meditation for mental clarity.',
              readTime: '6 min read',
              tags: ['mindfulness', 'beginner-friendly']
            },
            {
              title: 'Finding Joy in Movement',
              preview: 'Approaches to running that focus on enjoyment rather than metrics.',
              readTime: '5 min read',
              tags: ['joy of movement', 'mental health']
            }
          ],
          facts: [
            'Running releases endocannabinoids that create "runners high," a natural mood elevator.',
            'Outdoor running in green spaces has stronger mental health benefits than treadmill running.'
          ]
        },
        {
          title: 'HIIT Workouts',
          articles: [
            {
              title: 'HIIT for Mood: Quick Workouts for Mental Clarity',
              preview: 'How intensity can break through mental fog and boost energy.',
              readTime: '5 min read',
              tags: ['energy boost', 'quick workout']
            },
            {
              title: 'Making HIIT Sustainable and Enjoyable',
              preview: 'Adapting high-intensity training to support long-term wellbeing.',
              readTime: '7 min read',
              tags: ['sustainable fitness', 'modification options']
            }
          ],
          facts: [
            'Short bursts of intense activity can trigger a stronger release of mood-enhancing neurochemicals.',
            'Learning to safely push your limits in HIIT can build psychological resilience.'
          ]
        },
        {
          title: 'Low-Impact Options',
          articles: [
            {
              title: 'The Mental Benefits of Walking',
              preview: 'Why this simple activity might be the best thing for your brain.',
              readTime: '4 min read',
              tags: ['beginner-friendly', 'accessible']
            },
            {
              title: 'Swimming: Meditation in Motion',
              preview: 'How water-based exercise creates a unique mental state.',
              readTime: '6 min read',
              tags: ['mindfulness', 'low-impact']
            }
          ],
          facts: [
            'Walking meetings have been shown to increase creative thinking by up to 60%.',
            'The rhythmic nature of swimming has similar brainwave effects to meditation.'
          ]
        }
      ]
    },
    {
      id: 'strength',
      title: 'Strength Training',
      icon: 'dumbbell',
      color: '#3498db',
      gradient: ['#3498db', '#2980b9'],
      subcategories: [
        {
          title: 'Mind-Muscle Connection',
          articles: [
            {
              title: 'The Psychology of Strength',
              preview: 'How mental focus amplifies physical results and builds inner resilience.',
              readTime: '8 min read',
              tags: ['mindfulness', 'technique']
            },
            {
              title: 'Body Awareness Through Resistance Training',
              preview: 'Building a healthier relationship with your body through strength.',
              readTime: '7 min read',
              tags: ['body image', 'mindfulness']
            }
          ],
          facts: [
            'Conscious focus on muscle engagement can increase strength gains by up to 20%.',
            'Strength training improves body image regardless of physical changes in appearance.'
          ]
        },
        {
          title: 'Progressive Approaches',
          articles: [
            {
              title: 'Finding Your Starting Point',
              preview: 'Why meeting yourself where you are leads to sustainable progress.',
              readTime: '5 min read',
              tags: ['beginner-friendly', 'self-compassion']
            },
            {
              title: 'Beyond the Numbers: Non-Scale Victories in Strength',
              preview: 'Celebrating functional improvements and daily life benefits.',
              readTime: '6 min read',
              tags: ['progress mindset', 'holistic health']
            }
          ],
          facts: [
            'Starting with just bodyweight exercises builds the same foundational neural pathways as weighted training.',
            'Strength improvements correlate with increased confidence in daily activities.'
          ]
        },
        {
          title: 'Rest & Recovery',
          articles: [
            {
              title: 'The Mental Side of Recovery',
              preview: 'Why psychological rest is as important as physical recovery.',
              readTime: '7 min read',
              tags: ['recovery', 'mental health']
            },
            {
              title: 'Permission to Rest: Breaking the "No Days Off" Mentality',
              preview: 'Creating a sustainable, balanced approach to strength training.',
              readTime: '8 min read',
              tags: ['sustainable fitness', 'recovery']
            }
          ],
          facts: [
            'Quality recovery periods are when both muscle growth and mental resilience develop.',
            'Overtraining affects cognitive function before physical performance declines.'
          ]
        }
      ]
    },
    {
      id: 'nutrition',
      title: 'Nutrition',
      icon: 'food-apple',
      color: '#2ecc71',
      gradient: ['#2ecc71', '#27ae60'],
      subcategories: [
        {
          title: 'Mindful Eating',
          articles: [
            {
              title: 'Beyond Diet Culture: Finding Food Freedom',
              preview: 'Building a peaceful relationship with food and your body.',
              readTime: '9 min read',
              tags: ['mindful eating', 'body image']
            },
            {
              title: 'Hunger and Fullness: Reconnecting With Your Bodys Signals',
              preview: 'Learning to trust your bodys innate wisdom around food.',
              readTime: '7 min read',
              tags: ['intuitive eating', 'self-trust']
            }
          ],
          facts: [
            'Mindful eating practices can reduce emotional eating by helping identify true hunger vs. emotional needs.',
            'The brain takes approximately 20 minutes to register fullness signals from the digestive system.'
          ]
        },
        {
          title: 'Brain Foods',
          articles: [
            {
              title: 'Eating for Mental Clarity and Mood',
              preview: 'Nutrients that support cognitive function and emotional stability.',
              readTime: '8 min read',
              tags: ['nutrition', 'mental health']
            },
            {
              title: 'The Gut-Brain Connection',
              preview: 'How your microbiome influences your mood and mental health.',
              readTime: '10 min read',
              tags: ['gut health', 'science-based']
            }
          ],
          facts: [
            'Omega-3 fatty acids can reduce symptoms of depression and anxiety by reducing inflammation.',
            'Up to 95% of serotonin, a key mood regulator, is produced in the gut.'
          ]
        },
        {
          title: 'Sustainable Approaches',
          articles: [
            {
              title: 'Gentle Nutrition: Adding Rather Than Restricting',
              preview: 'Focus on nutritional additions rather than elimination for better mental health.',
              readTime: '6 min read',
              tags: ['positive nutrition', 'beginner friendly']
            },
            {
              title: 'Finding Your Personal Balance',
              preview: 'Creating an individualized approach that honors your unique needs.',
              readTime: '7 min read',
              tags: ['personalized nutrition', 'balance']
            }
          ],
          facts: [
            'Highly restrictive diets can trigger or worsen anxiety around food and eating.',
            'Including all food groups typically leads to better long-term adherence than elimination diets.'
          ]
        }
      ]
    },
    {
      id: 'flexibility',
      title: 'Movement & Mobility',
      icon: 'yoga',
      color: '#f39c12',
      gradient: ['#f39c12', '#d35400'],
      subcategories: [
        {
          title: 'Mind-Body Practices',
          articles: [
            {
              title: 'Yoga for Emotional Release',
              preview: 'How physical practices can help process difficult emotions.',
              readTime: '8 min read',
              tags: ['emotional wellbeing', 'yoga']
            },
            {
              title: 'Moving Meditation Techniques',
              preview: 'Finding stillness in movement for mental clarity.',
              readTime: '6 min read',
              tags: ['meditation', 'mindfulness']
            }
          ],
          facts: [
            'Slow, deliberate movement practices activate the parasympathetic "rest and digest" system.',
            'Yoga has been shown to reduce cortisol levels and improve GABA neurotransmitter function.'
          ]
        },
        {
          title: 'Body Awareness',
          articles: [
            {
              title: 'Proprioception: Your Bodys Hidden Sense',
              preview: 'Developing awareness of your body in space for better movement and confidence.',
              readTime: '7 min read',
              tags: ['body awareness', 'functional movement']
            },
            {
              title: 'Gentle Approaches to Mobility',
              preview: 'Accessible methods for all bodies to move with greater ease.',
              readTime: '5 min read',
              tags: ['inclusive fitness', 'beginner-friendly']
            }
          ],
          facts: [
            'Improved proprioception reduces anxiety by creating greater bodily security and confidence.',
            'Regular mobility work can decrease physical tension that accumulates from stress and anxiety.'
          ]
        },
        {
          title: 'Restorative Practices',
          articles: [
            {
              title: 'Restorative Yoga: The Art of Active Rest',
              preview: 'How supported poses create deep relaxation and healing.',
              readTime: '6 min read',
              tags: ['relaxation', 'stress relief']
            },
            {
              title: 'Breathwork and Movement Integration',
              preview: 'Combining breath patterns with gentle movement for nervous system regulation.',
              readTime: '7 min read',
              tags: ['nervous system', 'breathing techniques']
            }
          ],
          facts: [
            'Restorative practices have been shown to reduce anxiety symptoms by up to 30%.',
            'Just 10 minutes of gentle stretching before bed can improve sleep quality and reduce insomnia.'
          ]
        }
      ]
    },
    {
      id: 'community',
      title: 'Social Connection',
      icon: 'account-group',
      color: '#16a085',
      gradient: ['#16a085', '#1abc9c'],
      subcategories: [
        {
          title: 'Finding Your Tribe',
          articles: [
            {
              title: 'The Power of Supportive Fitness Communities',
              preview: 'How connection enhances motivation and mental wellbeing.',
              readTime: '6 min read',
              tags: ['community', 'support']
            },
            {
              title: 'Virtual vs. In-Person Community',
              preview: 'Finding connection in different formats for your personality and needs.',
              readTime: '5 min read',
              tags: ['social connection', 'introvert-friendly']
            }
          ],
          facts: [
            'Working out with others can increase exercise enjoyment by 26% compared to solo workouts.',
            'Social support is one of the strongest predictors of exercise adherence over time.'
          ]
        },
        {
          title: 'Communication & Boundaries',
          articles: [
            {
              title: 'Setting Healthy Boundaries in Fitness Spaces',
              preview: 'Creating safety and comfort in your exercise environment.',
              readTime: '7 min read',
              tags: ['boundaries', 'self-advocacy']
            },
            {
              title: 'Navigating Fitness Advice and Communities',
              preview: 'Filtering information and finding supportive voices.',
              readTime: '8 min read',
              tags: ['media literacy', 'community']
            }
          ],
          facts: [
            'Clear boundaries in fitness settings lead to greater enjoyment and consistency.',
            'Comparing your journey to others can reduce exercise enjoyment by up to 45%.'
          ]
        },
        {
          title: 'Movement as Connection',
          articles: [
            {
              title: 'Partner and Group Activities for Wellbeing',
              preview: 'Building relationships through shared movement experiences.',
              readTime: '5 min read',
              tags: ['connection', 'partner exercises']
            },
            {
              title: 'Intergenerational Movement: Connecting Across Ages',
              preview: 'The mental and physical benefits of multi-age fitness communities.',
              readTime: '6 min read',
              tags: ['community', 'inclusive fitness']
            }
          ],
          facts: [
            'Group exercise creates a sense of belonging that extends beyond physical benefits.',
            'Synchronized movement activities release more endorphins than individual exercise.'
          ]
        }
      ]
    }
  ];
  //opens the modal with category details
  const openCategoryModal = (category) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  //closes the category modal
  const closeCategoryModal = () => {
    setModalVisible(false);
  };

  //handles mood rating input and navigates user based on mood
  const handleMoodRating = (rating) => {
    const newMoodEntry = {
      rating: rating,
      date: new Date().toISOString(),
      note: '' 
    };
    

    setMoodHistory(prevHistory => [...prevHistory, newMoodEntry]);
    setMoodRating(rating);
    setShowMoodPrompt(false);
    
  };

  //displays a single article card with preview and tags
  const renderArticle = (article) => {
    return (
      <TouchableOpacity key={article.title} style={styles.articleCard}>
        <View style={styles.articleHeader}>
          <Text style={styles.articleTitle}>{article.title}</Text>
          <Text style={styles.readTime}>{article.readTime}</Text>
        </View>
        <Text style={styles.articlePreview}>{article.preview}</Text>
        
        <View style={styles.tagContainer}>
          {article.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.readMoreText}>Read more →</Text>
      </TouchableOpacity>
    );
  };

  //displays a single wellness fact
  const renderFact = (fact, index) => {
    return (
      <View key={index} style={styles.factContainer}>
        <Icon name="lightbulb-outline" size={18} color="#ffa500" style={styles.factIcon} />
        <Text style={styles.factText}>{fact}</Text>
      </View>
    );
  };

  //randomly shows a self-compassion prompt to encourage kindness
  const renderSelfCompassionPrompt = () => {
    const prompts = [
      "What would you say to a friend feeling the way you do now?",
      "What's one small way you can be kind to yourself today?",
      "Remember a time when you felt proud of yourself. What qualities did you show?",
      "What's one thing your body did for you today that you can appreciate?",
      "What's a challenge you've overcome that shows your strength?"
    ];
    
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    return (
      <View style={styles.compassionContainer}>
        <Text style={styles.compassionTitle}>Self-Compassion Moment</Text>
        <Text style={styles.compassionPrompt}>{randomPrompt}</Text>
      </View>
    );
  };

  //renders subcategory with articles and wellness facts
  const renderSubcategory = (subcategory, index) => {
    return (
      <View key={index} style={styles.subcategoryContainer}>
        <Text style={styles.subcategoryTitle}>{subcategory.title}</Text>
        
        <View style={styles.articlesContainer}>
          {subcategory.articles.map(renderArticle)}
        </View>
        
        <View style={styles.factsSection}>
          <Text style={styles.factsHeader}>Wellness Insights</Text>
          {subcategory.facts.map(renderFact)}
        </View>
      </View>
    );
  };
  //shows the breathing exercise overlay when triggered
  const renderBreathingExercise = () => {
    if (!showBreathingExercise) return null;
    
    return (
      <View style={breathingStyles.overlay}>
        <BreathingExercise onClose={() => setShowBreathingExercise(false)} />
      </View>
    );
  };

  // shows a daily affirmation overlay to boost positivity
  const renderDailyAffirmation = () => {
    if (!showDailyAffirmation) return null;
    
    return (
      <View style={styles.affirmationContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={() => setShowDailyAffirmation(false)}>
          <Icon name="close" size={20} color="#777" />
        </TouchableOpacity>
        
        <View style={styles.affirmationContent}>
          <Icon name="heart" size={28} color="#e74c3c" style={styles.affirmationIcon} />
          <Text style={styles.affirmationTitle}>Daily Affirmation</Text>
          <Text style={styles.affirmationText}>"{dailyAffirmation}"</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* mood check and breathing options */}
          {renderBreathingExercise()}
          {renderSelfCompassionPrompt()}
          {/*daily affirmation*/}
          {renderDailyAffirmation()}
          
          {/* title section*/}
          <Text style={styles.title}>Wellness Library</Text>
          <Text style={styles.subtitle}>Knowledge to support your mind & body</Text>
          <View style={styles.quickActionsContainer}>
  <TouchableOpacity 
    style={styles.quickActionButton}
    onPress={() => setShowBreathingExercise(true)}
  >
    <Icon name="weather-windy" size={24} color="#3498db" />
    <Text style={styles.quickActionText}>Breathe</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
  style={styles.quickActionButton}
  onPress={() => navigation.navigate('Tracking')}
>
  <Icon name="bell-outline" size={24} color="#e74c3c" />
  <Text style={styles.quickActionText}>Check-In</Text>
</TouchableOpacity>
</View>
          
          {/* Tip of the Day */}
          <View style={styles.tipContainer}>
            <Icon name="lightbulb-outline" size={24} color="#f39c12" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Wellness Tip</Text>
              <Text style={styles.tipText}>{randomTip}</Text>
            </View>
          </View>
          
          {/* Categories Grid */}
          <View style={styles.categoriesContainer}>
            {categories.map(category => (
              <TouchableOpacity 
                key={category.id}
                style={styles.categorySection}
                onPress={() => openCategoryModal(category)}
              > <View
  style={[
    styles.categoryBox,
    {backgroundColor: category.color}
  ]}
>
  <Icon name={category.icon} size={40} color="#fff" />
  <Text style={styles.categoryText}>{category.title}</Text>
  <View style={styles.exploreButton}>
    <Text style={styles.exploreText}>Explore</Text>
  </View>
</View>
              </TouchableOpacity>
            ))}
          </View>
          {/*mental health section*/}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Need Support?</Text>
            <Text style={styles.helpText}>
              Remember, it's okay to ask for help. If you're struggling with your mental health, 
              these resources are available 24/7:
            </Text>
            
            <View style={styles.helpButtons}>
              <TouchableOpacity style={styles.helpButton}>
                <Icon name="phone" size={24} color="#fff" />
                <Text style={styles.helpButtonText}>0300 304 7000</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.helpButton}>
                <Icon name="message-text" size={24} color="#fff" />
                <Text style={styles.helpButtonText}>jo@samaritans.org</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        
        {/* category detail modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={closeCategoryModal}
        >
          <SafeAreaView style={styles.modalContainer}>
            {selectedCategory && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={closeCategoryModal} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{selectedCategory.title}</Text>
                  <View style={{width: 24}} /> 
                </View>
                
                <ScrollView contentContainerStyle={styles.modalContent}>
                  {selectedCategory.subcategories.map(renderSubcategory)}
                </ScrollView>
              </>
            )}
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
      
    </View>
  );
};
const breathingStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginVertical: 10,
  },
  breathCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(52, 152, 219, 0.7)',
  },
  instructionText: {
    fontSize: 22,
    fontWeight: '500',
    marginTop: 20,
    color: '#333',
  },
  countText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: '#3498db',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 30,
    alignSelf: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingBottom: 70,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0d0dd4',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categorySection: {
    width: '48%',
    marginBottom: 15,
  },
  categoryBox: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    padding: 15,
  },
  categoryBoxActive: {
    shadowOpacity: 0.2,
    elevation: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  tapText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 5,
  },
  categoryDetails: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  subcategoryContainer: {
    marginBottom: 20,
  },
  subcategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  articlesContainer: {
    marginBottom: 15,
  },
  articleCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'space-evenly'
  },
  quickActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#555',
    marginTop: 5,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  readTime: {
    fontSize: 12,
    color: '#888',
  },
  articlePreview: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  readMoreText: {
    fontSize: 12,
    color: '#0d0dd4',
    fontWeight: '500',
    alignSelf: 'flex-end',
  },
  factsSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
  },
  factsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  factContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  factIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  factText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 15,
  },
  
  tipContainer: {
    backgroundColor: '#fff9e6',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  tipContent: {
    marginLeft: 10,
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 5,
  },
  tag: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#3498db',
  },
  
  exploreButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  exploreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  moodContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  moodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  moodSubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  moodOption: {
    alignItems: 'center',
    padding: 10,
  },
  moodText: {
    marginTop: 5,
    fontSize: 12,
    color: '#555',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  
  affirmationContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  affirmationContent: {
    alignItems: 'center',
  },
  affirmationIcon: {
    marginBottom: 10,
  },
  affirmationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  affirmationText: {
    fontSize: 16,
    color: '#444',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  helpSection: {
    backgroundColor: '#e8f4fc',
    borderRadius: 1,
    padding: 33,
    marginVertical: 20,
  },
compassionContainer: {
  backgroundColor: '#f0e6ff',
  borderRadius: 12,
  padding: 20,
  marginBottom: 25,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 3,
},
compassionTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
  marginBottom: 10,
},
compassionPrompt: {
  fontSize: 15,
  color: '#444',
  fontStyle: 'italic',
  marginBottom: 15,
  lineHeight: 22,
},
reflectButton: {
  backgroundColor: '#9370db',
  borderRadius: 20,
  paddingVertical: 8,
  paddingHorizontal: 15,
  alignSelf: 'flex-end',
},
reflectButtonText: {
  color: '#fff',
  fontSize: 13,
  fontWeight: '500',
},
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    lineHeight: 20,
  },
  helpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helpButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  helpButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 8,
  }
});
export default EducationScreen;