import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DietPlan as DietPlanType, Meal, DailyDietPlan } from '../types';
import { Utensils, Volume2, Calendar, Coffee, Sun, Moon, Apple } from 'lucide-react';

interface DietPlanProps {
  dietPlan: DietPlanType;
  onSpeakText: (text: string) => void;
}

const DietPlan: React.FC<DietPlanProps> = ({ dietPlan, onSpeakText }) => {
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);

  const mealIcons = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
    snacks: Apple
  };

  const selectedMeals = selectedMealType && Array.isArray(dietPlan[selectedMealType as keyof DietPlanType]) 
    ? dietPlan[selectedMealType as keyof DietPlanType] as Meal[] 
    : [];

  const getMealIcon = (mealType: string) => {
    const IconComponent = mealIcons[mealType as keyof typeof mealIcons] || Utensils;
    return <IconComponent className="w-6 h-6" />;
  };

  const speakMealType = (mealType: string) => {
    const mealNames = {
      breakfast: 'Breakfast',
      lunch: 'Lunch', 
      dinner: 'Dinner',
      snacks: 'Snacks'
    };
    onSpeakText(`${mealNames[mealType as keyof typeof mealNames]}: ${dietPlan.tips}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-2 sm:px-4"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800 dark:text-white">
        <Utensils className="inline w-6 h-6 sm:w-8 sm:h-8 mr-2 text-green-600" />
        <span className="block sm:inline">Your Diet Plan</span>
      </h2>

      {/* Meal Type Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
        {Object.keys(dietPlan).filter(key => key !== 'tips').map((mealType) => (
          <motion.button
            key={mealType}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMealType(selectedMealType === mealType ? null : mealType)}
            className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
              selectedMealType === mealType
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-center mb-2 text-green-600 dark:text-green-400">
              {getMealIcon(mealType)}
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white capitalize">
              {mealType}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              {Array.isArray(dietPlan[mealType as keyof DietPlanType]) ? (dietPlan[mealType as keyof DietPlanType] as Meal[]).length : 0} items
            </p>
          </motion.button>
        ))}
      </div>

      {/* Diet Plan Tips */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 sm:p-6 rounded-xl mb-6 sm:mb-8">
        <h3 className="font-semibold text-base sm:text-lg text-green-800 dark:text-green-200 mb-3">
          <Calendar className="inline w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Diet Plan Tips
        </h3>
        <p className="text-sm sm:text-base text-green-700 dark:text-green-300 mb-3">
          {dietPlan.tips}
        </p>
        <button
          onClick={() => onSpeakText(`Diet plan tip: ${dietPlan.tips}`)}
          className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          aria-label="Read diet plan tips"
        >
          <Volume2 className="inline w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Read tip</span>
          <span className="sm:hidden">Read</span>
        </button>
      </div>

      {/* Meal Details */}
      <AnimatePresence>
        {selectedMealType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6"
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white capitalize">
                {selectedMealType}
              </h3>
              <button
                onClick={() => speakMealType(selectedMealType)}
                className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                aria-label="Speak meal type"
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {selectedMeals.map((meal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4"
                >
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <h4 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-white">
                      {meal.name}
                    </h4>
                    {meal.imageUrl && (
                      <img 
                        src={meal.imageUrl} 
                        alt={meal.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg ml-3"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm sm:text-base text-green-600 dark:text-green-400">
                      {meal.calories} cal
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm mb-2 sm:mb-3">
                    <div className="text-center p-1 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="font-semibold text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                        {meal.protein}g
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Protein</p>
                    </div>
                    <div className="text-center p-1 sm:p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <p className="font-semibold text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">
                        {meal.carbs}g
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Carbs</p>
                    </div>
                    <div className="text-center p-1 sm:p-2 bg-red-50 dark:bg-red-900/20 rounded">
                      <p className="font-semibold text-xs sm:text-sm text-red-600 dark:text-red-400">
                        {meal.fat}g
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Fat</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                    {meal.description}
                  </p>

                  <button
                    onClick={() => onSpeakText(`${meal.name}. ${meal.description}. This meal contains ${meal.calories} calories, ${meal.protein} grams of protein, ${meal.carbs} grams of carbohydrates, and ${meal.fat} grams of fat.`)}
                    className="text-xs sm:text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                    aria-label="Read meal details"
                  >
                    <Volume2 className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Read meal details</span>
                    <span className="sm:hidden">Read</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DietPlan;
