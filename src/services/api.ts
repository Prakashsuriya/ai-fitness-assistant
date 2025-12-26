import { UserProfile, FitnessPlan } from '../types/index';

const GROQ_API_KEY = (import.meta.env?.VITE_GROQ_API_KEY as string) || '';
const PEXELS_API_KEY = (import.meta.env?.VITE_PEXELS_API_KEY as string) || '';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

export class ApiService {
  // Test method to verify API key works
  static async testGroqAPI(): Promise<boolean> {
    try {
      console.log('Testing Groq API connection...');
      
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: 'Say "API test successful" in JSON format: {"status": "success", "message": "API test successful"}'
            }
          ],
          temperature: 0.1,
          max_tokens: 50,
        }),
      });

      console.log('Test API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Test API Error Response:', errorText);
        return false;
      }

      const data = await response.json();
      console.log('Test API Response data:', data);
      return true;
    } catch (error) {
      console.error('Test API Error:', error);
      return false;
    }
  }

  static async generateFitnessPlan(userProfile: UserProfile): Promise<FitnessPlan> {
    console.log('Starting AI plan generation for:', userProfile.name);
    
    // First test the API
    const apiWorks = await this.testGroqAPI();
    if (!apiWorks) {
      console.error('Groq API test failed, using fallback');
      return this.generateFallbackPlan(userProfile);
    }
    
    try {
      // Use Groq API to generate personalized plan (without images)
      const prompt = this.createPrompt(userProfile);
      console.log('Generated prompt:', prompt);
      
      console.log('Making API call to Groq...');
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a professional fitness and nutrition coach. Generate detailed, personalized fitness plans based on user profiles. Return the response in valid JSON format only, no additional text. Structure: { "workoutPlan": [{ "day": "Monday", "exercises": [{ "name": "Push-ups", "sets": 3, "reps": 12, "restTime": 60, "instructions": "Detailed instructions", "muscleGroup": "Chest", "imageUrl": "" }], "tips": "Daily tip" }], "dietPlan": { "breakfast": [{ "name": "Oatmeal", "calories": 300, "protein": 10, "carbs": 45, "fat": 8, "description": "Healthy breakfast", "imageUrl": "" }], "lunch": [], "dinner": [], "snacks": [], "tips": "Nutrition tip" }, "motivationTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"] }. IMPORTANT: Always leave imageUrl fields empty ("") - they will be filled by real image API.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 8000,
        }),
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API call failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid API response structure');
      }
      
      const aiResponse = data.choices[0].message.content;
      console.log('Raw AI response:', aiResponse);
      
      // Clean up the response and extract JSON
      let jsonStr = aiResponse;
      
      // Remove any markdown code blocks
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to fix incomplete JSON by adding missing brackets/commas
      try {
        const aiPlan = JSON.parse(jsonStr);
        console.log('Parsed AI plan successfully:', aiPlan);
        console.log('AI diet plan:', aiPlan.dietPlan);
        
        // Create fitness plan with AI-generated content (no images initially)
        const plan: FitnessPlan = {
          userProfile,
          workoutPlan: aiPlan.workoutPlan,
          dietPlan: aiPlan.dietPlan || { breakfast: [], lunch: [], dinner: [], snacks: [], tips: '' },
          motivationTips: aiPlan.motivationTips,
          generatedAt: new Date(),
        };
        
        console.log('Final diet plan:', plan.dietPlan);
        console.log('Final AI-generated plan created successfully');
        
        // Generate real images for the plan
        await this.generateRealImages(plan);
        
        return plan;
      } catch (parseError) {
        console.error('JSON parse error, attempting to fix incomplete JSON:', parseError);
        
        // Try to fix incomplete JSON by finding the last complete object
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const fixedJson = jsonMatch[0];
            console.log('Attempting to parse fixed JSON:', fixedJson);
            const aiPlan = JSON.parse(fixedJson);
            
            const plan: FitnessPlan = {
              userProfile,
              workoutPlan: aiPlan.workoutPlan || [],
              dietPlan: aiPlan.dietPlan || { breakfast: [], lunch: [], dinner: [], snacks: [], tips: '' },
              motivationTips: aiPlan.motivationTips || [],
              generatedAt: new Date(),
            };
            
            console.log('Fixed AI plan created successfully');
            return plan;
          } catch (secondError) {
            console.error('Fixed JSON also failed:', secondError);
            throw secondError;
          }
        }
        
        throw parseError;
      }
    } catch (error) {
      console.error('Error generating AI plan, falling back to template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
      console.error('Error details:', errorMessage, errorStack);
      // Fallback to template if AI fails
      return this.generateFallbackPlan(userProfile);
    }
  }

  private static async generateRealImages(plan: FitnessPlan): Promise<void> {
    try {
      console.log('Generating real images for AI plan...');
      
      // Generate exercise images
      for (const workoutDay of plan.workoutPlan) {
        for (const exercise of workoutDay.exercises) {
          if (!exercise.imageUrl || exercise.imageUrl.includes('example.com')) {
            exercise.imageUrl = await this.getExerciseImage(exercise.name, exercise.muscleGroup);
          }
        }
      }
      
      console.log('Diet plan structure:', Object.keys(plan.dietPlan));
      
      // Check if it's the new daily structure or old structure
      const hasDailyStructure = Object.keys(plan.dietPlan).some(key => 
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(key)
      );
      
      if (hasDailyStructure) {
        // New daily structure
        console.log('Using new daily diet structure');
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        for (const day of days) {
          const dailyPlan = plan.dietPlan[day] as any;
          if (dailyPlan) {
            const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
            for (const mealType of mealTypes) {
              const meals = dailyPlan[mealType] as any[];
              if (meals && meals.length > 0) {
                console.log(`Generating images for ${day} ${mealType}`);
                for (const meal of meals) {
                  if (!meal.imageUrl || meal.imageUrl.includes('example.com')) {
                    meal.imageUrl = await this.getFoodImage(meal.name);
                  }
                }
              }
            }
          }
        }
      } else {
        // Old structure - generate images for the flat structure
        console.log('Using old flat diet structure');
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
        for (const mealType of mealTypes) {
          const meals = plan.dietPlan[mealType as keyof typeof plan.dietPlan] as any[];
          if (meals && meals.length > 0) {
            console.log(`Generating images for ${mealType}`);
            for (const meal of meals) {
              if (!meal.imageUrl || meal.imageUrl.includes('example.com')) {
                meal.imageUrl = await this.getFoodImage(meal.name);
              }
            }
          }
        }
      }
      
      console.log('Real images generated successfully');
    } catch (error) {
      console.error('Error generating real images:', error);
    }
  }

  // New method to generate images for a specific day
  static async generateDayImages(plan: FitnessPlan, dayIndex: number): Promise<void> {
    try {
      const workoutDay = plan.workoutPlan[dayIndex];
      if (!workoutDay) return;

      // Generate exercise images for this day
      const exercisePromises = workoutDay.exercises.map(exercise =>
        this.getExerciseImage(exercise.name, exercise.muscleGroup)
          .then(url => { exercise.imageUrl = url; })
      );

      // Generate meal images for this day
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
      const mealPromises = mealTypes.map(mealType => {
        const meals = plan.dietPlan[mealType as keyof typeof plan.dietPlan] as any[];
        if (meals && meals.length > 0) {
          return this.getFoodImage(meals[0].name)
            .then(url => { meals[0].imageUrl = url; });
        }
        return Promise.resolve();
      });

      // Wait for all images to load
      await Promise.allSettled([...exercisePromises, ...mealPromises]);
    } catch (error) {
      console.error('Error generating day images:', error);
    }
  }

  private static createPrompt(userProfile: UserProfile): string {
    return `Generate a personalized 7-day fitness and nutrition plan for this user:

User Profile:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Height: ${userProfile.height}cm
- Weight: ${userProfile.weight}kg
- Fitness Goal: ${userProfile.fitnessGoal}
- Fitness Level: ${userProfile.fitnessLevel}
- Workout Location: ${userProfile.workoutLocation}
- Dietary Preference: ${userProfile.dietaryPreference}
- Medical History: ${userProfile.medicalHistory || 'None'}
- Stress Level: ${userProfile.stressLevel || 'Not specified'}

Requirements:
1. Create 7 different workout days (Monday to Sunday)
2. Each day should have 2-3 exercises appropriate for their fitness level and goal
3. Include specific sets, reps, rest times, and detailed instructions
4. Create a DIFFERENT meal plan for each day (Monday to Sunday) with breakfast, lunch, dinner, and snacks
5. Include calorie and macro information for each meal
6. Provide 5 motivational tips specific to their goal
7. Consider their dietary preferences and any medical conditions
8. Make the plan progressive and suitable for their workout location
9. IMPORTANT: Each day must have different meals - no repetition across days

Please ensure the plan is truly personalized and different for each user based on their specific profile.`;
  }

  private static async generateFallbackPlan(userProfile: UserProfile): Promise<FitnessPlan> {
    // Generate dynamic workout plan based on user profile
    const workoutPlan = this.generateWorkoutPlan(userProfile);
    const dietPlan = this.generateDietPlan(userProfile);
    const motivationTips = this.generateMotivationTips(userProfile.fitnessGoal);

    const plan: FitnessPlan = {
      userProfile,
      workoutPlan,
      dietPlan,
      motivationTips,
      generatedAt: new Date(),
    };

    // Generate images in parallel for better performance
    const imagePromises = [];
    
    // Collect all exercise image promises
    for (const workoutDay of plan.workoutPlan) {
      for (const exercise of workoutDay.exercises) {
        imagePromises.push(
          this.getExerciseImage(exercise.name, exercise.muscleGroup)
            .then(url => { exercise.imageUrl = url; })
        );
      }
    }
    
    // Collect all food image promises
    for (const mealType of Object.keys(plan.dietPlan)) {
      if (mealType !== 'tips') {
        const meals = plan.dietPlan[mealType as keyof typeof plan.dietPlan] as any[];
        for (const meal of meals) {
          imagePromises.push(
            this.getFoodImage(meal.name)
              .then(url => { meal.imageUrl = url; })
          );
        }
      }
    }
    
    // Wait for all images to load in parallel
    await Promise.allSettled(imagePromises);
    
    return plan;
  }

  private static getFallbackPlan(userProfile: UserProfile): FitnessPlan {
    // Generate dynamic workout plan based on user profile
    const workoutPlan = this.generateWorkoutPlan(userProfile);
    const dietPlan = this.generateDietPlan(userProfile);
    const motivationTips = this.generateMotivationTips(userProfile.fitnessGoal);

    return {
      userProfile,
      workoutPlan,
      dietPlan,
      motivationTips,
      generatedAt: new Date(),
    };
  }

  private static generateWorkoutPlan(userProfile: UserProfile): any[] {
    const exercises = this.getExercisesByGoal(userProfile.fitnessGoal, userProfile.fitnessLevel);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map((day, index) => {
      const dayExercises = exercises.slice(index * 2, (index * 2) + 2);
      return {
        day,
        exercises: dayExercises.map(exercise => ({ ...exercise, imageUrl: '' })),
        tips: this.getWorkoutTip(day, userProfile.fitnessLevel)
      };
    });
  }

  private static generateDietPlan(userProfile: UserProfile): any {
    const meals = this.getMealsByGoal(userProfile.fitnessGoal, userProfile.dietaryPreference);
    
    console.log('Generated fallback meals:', meals);
    
    const dietPlan = {
      breakfast: meals.breakfast.map((meal: any) => ({ ...meal, imageUrl: '' })),
      lunch: meals.lunch.map((meal: any) => ({ ...meal, imageUrl: '' })),
      dinner: meals.dinner.map((meal: any) => ({ ...meal, imageUrl: '' })),
      snacks: meals.snacks.map((meal: any) => ({ ...meal, imageUrl: '' })),
      tips: this.getDietTip(userProfile.fitnessGoal, userProfile.dietaryPreference)
    };
    
    console.log('Generated fallback diet plan:', dietPlan);
    return dietPlan;
  }

  private static generateMotivationTips(fitnessGoal: string): string[] {
    const tips = {
      weight_loss: [
        'Every workout brings you closer to your goals!',
        'Consistency is the key to lasting results.',
        'You are stronger than you think!',
        'Progress, not perfection, is the goal.',
        'Your future self will thank you for today\'s effort!'
      ],
      muscle_gain: [
        'Every rep builds the stronger version of you!',
        'Trust the process and embrace the journey.',
        'Strength grows from consistent effort.',
        'You are capable of amazing things!',
        'Each workout is an investment in yourself!'
      ],
      general_fitness: [
        'Every workout counts, no matter how small!',
        'Progress, not perfection, is the goal.',
        'You are stronger than you think!',
        'Consistency creates results.',
        'Your health is your wealth!'
      ]
    };
    
    return tips[fitnessGoal as keyof typeof tips] || tips.general_fitness;
  }

  private static getExercisesByGoal(goal: string, level: string): any[] {
    const exercises = {
      weight_loss: {
        beginner: [
          { name: 'Push-ups', sets: 2, reps: 8, restTime: 60, instructions: 'Start in plank position, lower body until chest nearly touches floor, push back up', muscleGroup: 'Chest' },
          { name: 'Bodyweight Squats', sets: 2, reps: 10, restTime: 60, instructions: 'Stand with feet shoulder-width apart, lower body as if sitting in chair, return to standing', muscleGroup: 'Legs' },
          { name: 'Burpees', sets: 2, reps: 5, restTime: 90, instructions: 'From standing, drop to plank, do push-up, jump feet to hands, jump up with arms overhead', muscleGroup: 'Full Body' },
          { name: 'Bicycle Crunches', sets: 2, reps: 15, restTime: 60, instructions: 'Lie on back, bring opposite elbow to knee in a cycling motion', muscleGroup: 'Core' },
          { name: 'Plank', sets: 2, reps: 20, restTime: 60, instructions: 'Hold plank position with straight body, engage core muscles', muscleGroup: 'Core' },
          { name: 'Jumping Jacks', sets: 2, reps: 15, restTime: 60, instructions: 'Jump while spreading legs and raising arms overhead, return to starting position', muscleGroup: 'Full Body' },
          { name: 'Dumbbell Rows', sets: 2, reps: 8, restTime: 60, instructions: 'Bend over with flat back, pull dumbbells to chest, squeeze back muscles', muscleGroup: 'Back' },
          { name: 'Shoulder Press', sets: 2, reps: 8, restTime: 60, instructions: 'Press dumbbells overhead from shoulder height, lower with control', muscleGroup: 'Shoulders' },
          { name: 'Lunges', sets: 2, reps: 8, restTime: 60, instructions: 'Step forward with one leg, lower hips until both knees are bent at 90 degrees', muscleGroup: 'Legs' },
          { name: 'Mountain Climbers', sets: 2, reps: 15, restTime: 60, instructions: 'Start in plank position, alternate bringing knees toward chest in a running motion', muscleGroup: 'Core' },
          { name: 'Deadlifts', sets: 2, reps: 5, restTime: 90, instructions: 'Hinge at hips, keep back straight, lift bar to standing position', muscleGroup: 'Full Body' },
          { name: 'Pull-ups', sets: 2, reps: 3, restTime: 90, instructions: 'Hang from bar, pull body up until chin clears bar, lower with control', muscleGroup: 'Back' },
          { name: 'Yoga Flow', sets: 1, reps: 15, restTime: 30, instructions: 'Flow through sun salutation and gentle stretching poses', muscleGroup: 'Flexibility' },
          { name: 'Light Walk', sets: 1, reps: 20, restTime: 0, instructions: 'Take a relaxing 20-minute walk for active recovery', muscleGroup: 'Cardio' }
        ],
        intermediate: [
          { name: 'Push-ups', sets: 3, reps: 15, restTime: 60, instructions: 'Start in plank position, lower body until chest nearly touches floor, push back up', muscleGroup: 'Chest' },
          { name: 'Bodyweight Squats', sets: 3, reps: 20, restTime: 60, instructions: 'Stand with feet shoulder-width apart, lower body as if sitting in chair, return to standing', muscleGroup: 'Legs' },
          { name: 'Burpees', sets: 3, reps: 10, restTime: 90, instructions: 'From standing, drop to plank, do push-up, jump feet to hands, jump up with arms overhead', muscleGroup: 'Full Body' },
          { name: 'Bicycle Crunches', sets: 3, reps: 25, restTime: 60, instructions: 'Lie on back, bring opposite elbow to knee in a cycling motion', muscleGroup: 'Core' },
          { name: 'Plank', sets: 3, reps: 45, restTime: 60, instructions: 'Hold plank position with straight body, engage core muscles', muscleGroup: 'Core' },
          { name: 'Jumping Jacks', sets: 3, reps: 25, restTime: 60, instructions: 'Jump while spreading legs and raising arms overhead, return to starting position', muscleGroup: 'Full Body' },
          { name: 'Dumbbell Rows', sets: 3, reps: 15, restTime: 60, instructions: 'Bend over with flat back, pull dumbbells to chest, squeeze back muscles', muscleGroup: 'Back' },
          { name: 'Shoulder Press', sets: 3, reps: 12, restTime: 60, instructions: 'Press dumbbells overhead from shoulder height, lower with control', muscleGroup: 'Shoulders' },
          { name: 'Lunges', sets: 3, reps: 12, restTime: 60, instructions: 'Step forward with one leg, lower hips until both knees are bent at 90 degrees', muscleGroup: 'Legs' },
          { name: 'Mountain Climbers', sets: 3, reps: 25, restTime: 60, instructions: 'Start in plank position, alternate bringing knees toward chest in a running motion', muscleGroup: 'Core' },
          { name: 'Deadlifts', sets: 3, reps: 8, restTime: 90, instructions: 'Hinge at hips, keep back straight, lift bar to standing position', muscleGroup: 'Full Body' },
          { name: 'Pull-ups', sets: 3, reps: 6, restTime: 90, instructions: 'Hang from bar, pull body up until chin clears bar, lower with control', muscleGroup: 'Back' },
          { name: 'Yoga Flow', sets: 1, reps: 25, restTime: 30, instructions: 'Flow through sun salutation and gentle stretching poses', muscleGroup: 'Flexibility' },
          { name: 'Light Walk', sets: 1, reps: 30, restTime: 0, instructions: 'Take a relaxing 30-minute walk for active recovery', muscleGroup: 'Cardio' }
        ]
      },
      muscle_gain: {
        beginner: [
          { name: 'Push-ups', sets: 3, reps: 10, restTime: 90, instructions: 'Start in plank position, lower body until chest nearly touches floor, push back up', muscleGroup: 'Chest' },
          { name: 'Bodyweight Squats', sets: 3, reps: 12, restTime: 90, instructions: 'Stand with feet shoulder-width apart, lower body as if sitting in chair, return to standing', muscleGroup: 'Legs' },
          { name: 'Burpees', sets: 3, reps: 6, restTime: 120, instructions: 'From standing, drop to plank, do push-up, jump feet to hands, jump up with arms overhead', muscleGroup: 'Full Body' },
          { name: 'Bicycle Crunches', sets: 3, reps: 20, restTime: 60, instructions: 'Lie on back, bring opposite elbow to knee in a cycling motion', muscleGroup: 'Core' },
          { name: 'Plank', sets: 3, reps: 30, restTime: 60, instructions: 'Hold plank position with straight body, engage core muscles', muscleGroup: 'Core' },
          { name: 'Jumping Jacks', sets: 3, reps: 20, restTime: 60, instructions: 'Jump while spreading legs and raising arms overhead, return to starting position', muscleGroup: 'Full Body' },
          { name: 'Dumbbell Rows', sets: 3, reps: 10, restTime: 90, instructions: 'Bend over with flat back, pull dumbbells to chest, squeeze back muscles', muscleGroup: 'Back' },
          { name: 'Shoulder Press', sets: 3, reps: 8, restTime: 90, instructions: 'Press dumbbells overhead from shoulder height, lower with control', muscleGroup: 'Shoulders' },
          { name: 'Lunges', sets: 3, reps: 10, restTime: 90, instructions: 'Step forward with one leg, lower hips until both knees are bent at 90 degrees', muscleGroup: 'Legs' },
          { name: 'Mountain Climbers', sets: 3, reps: 20, restTime: 60, instructions: 'Start in plank position, alternate bringing knees toward chest in a running motion', muscleGroup: 'Core' },
          { name: 'Deadlifts', sets: 3, reps: 6, restTime: 120, instructions: 'Hinge at hips, keep back straight, lift bar to standing position', muscleGroup: 'Full Body' },
          { name: 'Pull-ups', sets: 3, reps: 4, restTime: 120, instructions: 'Hang from bar, pull body up until chin clears bar, lower with control', muscleGroup: 'Back' },
          { name: 'Yoga Flow', sets: 1, reps: 20, restTime: 30, instructions: 'Flow through sun salutation and gentle stretching poses', muscleGroup: 'Flexibility' },
          { name: 'Light Walk', sets: 1, reps: 25, restTime: 0, instructions: 'Take a relaxing 25-minute walk for active recovery', muscleGroup: 'Cardio' }
        ]
      }
    };

    const goalExercises = exercises[goal as keyof typeof exercises] || exercises.weight_loss;
    return goalExercises[level as keyof typeof goalExercises] || goalExercises.beginner;
  }

  private static getMealsByGoal(goal: string, dietPreference: string): any {
    const meals = {
      weight_loss: {
        breakfast: [{ name: 'Oatmeal with Berries', calories: 250, protein: 8, carbs: 40, fat: 6, description: 'Whole grain oatmeal topped with fresh berries and a sprinkle of nuts' }],
        lunch: [{ name: 'Grilled Chicken Salad', calories: 350, protein: 30, carbs: 15, fat: 12, description: 'Mixed greens with grilled chicken breast, vegetables, and light vinaigrette' }],
        dinner: [{ name: 'Salmon with Vegetables', calories: 400, protein: 35, carbs: 20, fat: 18, description: 'Grilled salmon fillet with roasted vegetables and quinoa' }],
        snacks: [{ name: 'Greek Yogurt', calories: 120, protein: 12, carbs: 10, fat: 3, description: 'Plain Greek yogurt with honey and almonds' }]
      },
      muscle_gain: {
        breakfast: [{ name: 'Protein Pancakes', calories: 350, protein: 20, carbs: 45, fat: 8, description: 'High protein pancakes with banana and honey' }],
        lunch: [{ name: 'Beef and Rice Bowl', calories: 450, protein: 35, carbs: 40, fat: 15, description: 'Lean beef with brown rice and steamed vegetables' }],
        dinner: [{ name: 'Chicken Breast with Sweet Potato', calories: 500, protein: 40, carbs: 35, fat: 12, description: 'Grilled chicken breast with roasted sweet potato and green beans' }],
        snacks: [{ name: 'Protein Shake', calories: 200, protein: 25, carbs: 15, fat: 5, description: 'Whey protein shake with banana and peanut butter' }]
      }
    };

    return meals[goal as keyof typeof meals] || meals.weight_loss;
  }

  private static getWorkoutTip(day: string, level: string): string {
    const tips: Record<string, Record<string, string>> = {
      beginner: {
        Monday: 'Focus on proper form and breathing',
        Tuesday: 'Keep your core tight throughout the movements',
        Wednesday: 'Maintain steady breathing throughout exercises',
        Thursday: 'Focus on controlled movements',
        Friday: 'Keep core engaged throughout movements',
        Saturday: 'Focus on proper form to prevent injury',
        Sunday: 'Rest and recovery are essential for progress'
      }
    };
    return tips[level]?.[day] || 'Listen to your body and stay hydrated!';
  }

  private static getDietTip(goal: string, dietPreference: string): string {
    const tips = {
      weight_loss: 'Stay hydrated by drinking at least 8 glasses of water daily and focus on portion control',
      muscle_gain: 'Consume adequate protein throughout the day and stay hydrated for optimal performance',
      general_fitness: 'Maintain a balanced diet with plenty of fruits, vegetables and whole grains'
    };
    return tips[goal as keyof typeof tips] || tips.general_fitness;
  }

  private static async getExerciseImage(exerciseName: string, muscleGroup: string): Promise<string> {
    try {
      // More specific search queries for better results
      const searchQueries = [
        `${exerciseName} exercise`,
        `${exerciseName} workout`,
        `${muscleGroup} exercise`,
        `${exerciseName} fitness`
      ];
      
      for (const query of searchQueries) {
        const images = await this.searchImages(query, 1);
        if (images.length > 0 && images[0].src.medium) {
          return images[0].src.medium;
        }
      }
      
      return '';
    } catch (error) {
      console.error('Error getting exercise image:', error);
      return '';
    }
  }

  private static async getFoodImage(foodName: string): Promise<string> {
    try {
      console.log(`Getting food image for: ${foodName}`);
      
      // More specific search queries for better food results
      const searchQueries = [
        `${foodName} healthy food`,
        `${foodName} nutrition`,
        `${foodName} meal`,
        `${foodName} dish`
      ];
      
      for (const query of searchQueries) {
        console.log(`Searching images with query: ${query}`);
        const images = await this.searchImages(query, 1);
        if (images.length > 0 && images[0].src.medium) {
          console.log(`Found image: ${images[0].src.medium}`);
          return images[0].src.medium;
        }
      }
      
      console.log(`No images found for ${foodName}, returning empty string`);
      return '';
    } catch (error) {
      console.error('Error getting food image:', error);
      return '';
    }
  }

  static async searchImages(query: string, perPage: number = 5): Promise<any[]> {
    try {
      console.log(`Searching images with query: ${query}`);
      const response = await fetch(`${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}`, {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      return data.photos;
    } catch (error) {
      console.error('Error searching images:', error);
      return [];
    }
  }
}