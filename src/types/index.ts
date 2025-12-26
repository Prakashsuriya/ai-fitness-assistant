export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other' | '';
  height: number;
  weight: number;
  fitnessGoal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'general_fitness' | '';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | '';
  workoutLocation: 'home' | 'gym' | 'outdoor' | '';
  dietaryPreference: 'omnivore' | 'non-vegetarian' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | '';
  medicalHistory?: string;
  stressLevel?: 'low' | 'moderate' | 'high' | '';
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  instructions: string;
  muscleGroup: string;
  imageUrl?: string;
}

export interface WorkoutDay {
  day: string;
  exercises: Exercise[];
  tips: string;
}

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  imageUrl?: string;
}

export interface DietPlan {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
  tips: string;
  [key: string]: Meal[] | string | DailyDietPlan; // Allow string indexing
}

export interface DailyDietPlan {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
  tips: string;
}

export interface FitnessPlan {
  userProfile: UserProfile;
  workoutPlan: WorkoutDay[];
  dietPlan: DietPlan;
  motivationTips: string[];
  generatedAt: Date;
}
