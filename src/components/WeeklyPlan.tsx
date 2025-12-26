import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Dumbbell, Utensils, Calendar, Clock, Target, Volume2 } from 'lucide-react';
import { FitnessPlan, WorkoutDay, DailyDietPlan } from '../types/index';
import { ApiService } from '../services/api';

interface WeeklyPlanProps {
  fitnessPlan: FitnessPlan;
  onSpeakText: (text: string) => void;
}

const WeeklyPlan: React.FC<WeeklyPlanProps> = ({ fitnessPlan, onSpeakText }) => {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadedDays, setLoadedDays] = useState<Set<number>>(new Set());

  const currentDay = fitnessPlan.workoutPlan[currentDayIndex];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayClick = async (dayIndex: number) => {
    if (loadedDays.has(dayIndex)) {
      setCurrentDayIndex(dayIndex);
      return;
    }

    setLoadingImages(true);
    try {
      await ApiService.generateDayImages(fitnessPlan, dayIndex);
      setLoadedDays(prev => new Set([...prev, dayIndex]));
      setCurrentDayIndex(dayIndex);
    } catch (error) {
      console.error('Error loading day images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const nextDay = () => {
    const nextIndex = (currentDayIndex + 1) % days.length;
    handleDayClick(nextIndex);
  };

  const prevDay = () => {
    const prevIndex = (currentDayIndex - 1 + days.length) % days.length;
    handleDayClick(prevIndex);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        Your Weekly Fitness Plan
      </h2>

      {/* Day Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {days.map((day, index) => (
            <button
              key={day}
              onClick={() => handleDayClick(index)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentDayIndex === index
                  ? 'bg-blue-500 text-white'
                  : loadedDays.has(index)
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white'
              }`}
              disabled={loadingImages}
            >
              <Calendar className="inline w-4 h-4 mr-1" />
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loadingImages && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading {days[currentDayIndex]} plan...</p>
        </div>
      )}

      {/* Current Day Content */}
      <AnimatePresence mode="wait">
        {!loadingImages && currentDay && (
          <motion.div
            key={currentDayIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Day Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{currentDay.day}</h3>
                  <p className="text-white/80 mt-1">{currentDay.tips}</p>
                </div>
                <button
                  onClick={() => onSpeakText(`${currentDay.day}. ${currentDay.tips}`)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Speak day tips"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Workout Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="flex items-center text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  <Dumbbell className="w-5 h-5 mr-2" />
                  Workout Plan
                </h4>
                <div className="space-y-3">
                  {currentDay.exercises.map((exercise, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-600 rounded-lg p-3"
                    >
                      <div className="flex items-start space-x-3">
                        {exercise.imageUrl ? (
                          <img
                            src={exercise.imageUrl}
                            alt={exercise.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-500 rounded-lg flex items-center justify-center">
                            <Dumbbell className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-gray-800 dark:text-white">{exercise.name}</h5>
                            <button
                              onClick={() => onSpeakText(`${exercise.name}. ${exercise.instructions}. Perform ${exercise.sets} sets of ${exercise.reps} repetitions with ${exercise.restTime} seconds rest between sets.`)}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                              aria-label="Speak exercise details"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {exercise.sets} sets × {exercise.reps} reps • {exercise.restTime}s rest
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {exercise.instructions}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Diet Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="flex items-center text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  <Utensils className="w-5 h-5 mr-2" />
                  Nutrition Plan
                </h4>
                <div className="space-y-3">
                  {/* Check if dietPlan has daily structure or old structure */}
                  {(fitnessPlan.dietPlan[currentDay.day] as DailyDietPlan) ? (
                    // New daily structure
                    Object.entries((fitnessPlan.dietPlan[currentDay.day] as DailyDietPlan)).map(([mealType, meals]) => {
                      if (mealType === 'tips') return null;
                      const meal = (meals as any[])[0]; // Show first meal of each type
                      if (!meal) return null;

                      return (
                        <motion.div
                          key={mealType}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-gray-600 rounded-lg p-3"
                        >
                          <div className="flex items-start space-x-3">
                            {meal.imageUrl ? (
                              <img
                                src={meal.imageUrl}
                                alt={meal.name}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => { 
                                  console.log(`Failed to load image: ${meal.imageUrl}`);
                                  (e.target as HTMLImageElement).style.display = 'none'; 
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-500 rounded-lg flex items-center justify-center">
                                <Utensils className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="font-semibold text-gray-800 dark:text-white capitalize">
                                  {mealType}: {meal.name}
                                </h5>
                                <button
                                  onClick={() => onSpeakText(`${mealType}: ${meal.name}. ${meal.description}. This meal contains ${meal.calories} calories, ${meal.protein} grams of protein, ${meal.carbs} grams of carbohydrates, and ${meal.fat} grams of fat.`)}
                                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                                  aria-label="Speak meal details"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {meal.calories} cal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {meal.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    // Old structure - show meals for all days
                    Object.entries(fitnessPlan.dietPlan).map(([mealType, meals]) => {
                      if (mealType === 'tips') return null;
                      const meal = (meals as any[])[0]; // Show first meal of each type
                      if (!meal) return null;

                      return (
                        <motion.div
                          key={mealType}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-gray-600 rounded-lg p-3"
                        >
                          <div className="flex items-start space-x-3">
                            {meal.imageUrl ? (
                              <img
                                src={meal.imageUrl}
                                alt={meal.name}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => { 
                                  console.log(`Failed to load image: ${meal.imageUrl}`);
                                  (e.target as HTMLImageElement).style.display = 'none'; 
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-500 rounded-lg flex items-center justify-center">
                                <Utensils className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="font-semibold text-gray-800 dark:text-white capitalize">
                                  {mealType}: {meal.name}
                                </h5>
                                <button
                                  onClick={() => onSpeakText(`${mealType}: ${meal.name}. ${meal.description}. This meal contains ${meal.calories} calories, ${meal.protein} grams of protein, ${meal.carbs} grams of carbohydrates, and ${meal.fat} grams of fat.`)}
                                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                                  aria-label="Speak meal details"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {meal.calories} cal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {meal.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevDay}
                className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                disabled={loadingImages}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Day {currentDayIndex + 1} of {days.length}
              </span>
              <button
                onClick={nextDay}
                className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                disabled={loadingImages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diet Tips */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Nutrition Tip</h4>
            <p className="text-sm text-blue-700 dark:text-blue-200">{fitnessPlan.dietPlan.tips}</p>
          </div>
          <button
            onClick={() => onSpeakText(`Nutrition tip: ${fitnessPlan.dietPlan.tips}`)}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
            aria-label="Speak nutrition tip"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default WeeklyPlan;
