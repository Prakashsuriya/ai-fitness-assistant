import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutDay } from '../types';
import { Dumbbell, Play, Volume2, Clock, Target } from 'lucide-react';

interface WorkoutPlanProps {
  workoutPlan: WorkoutDay[];
  onSpeakText: (text: string) => void;
}

const WorkoutPlan: React.FC<WorkoutPlanProps> = ({ workoutPlan, onSpeakText }) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const selectedWorkout = workoutPlan.find(day => day.day === selectedDay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-2 sm:px-4"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800 dark:text-white">
        <Dumbbell className="inline w-6 h-6 sm:w-8 sm:h-8 mr-2 text-blue-600" />
        <span className="block sm:inline">Your Workout Plan</span>
      </h2>

      {/* Day Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {workoutPlan.map((day, index) => (
          <motion.button
            key={day.day}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
            className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
              selectedDay === day.day
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-white">
              Day {index + 1}: {day.day}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              {day.exercises.length} exercises
            </p>
          </motion.button>
        ))}
      </div>

      {/* Exercise Details */}
      <AnimatePresence>
        {selectedWorkout && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                {selectedWorkout.day}
              </h3>
              <button
                onClick={() => onSpeakText(`Today is ${selectedWorkout.day}. ${selectedWorkout.tips}`)}
                className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                aria-label="Speak workout tips"
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                <Target className="inline w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                {selectedWorkout.tips}
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {selectedWorkout.exercises.map((exercise, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4"
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <h4 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-white">
                      {exercise.name}
                    </h4>
                    {exercise.imageUrl ? (
                      <img 
                        src={exercise.imageUrl} 
                        alt={exercise.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg ml-3"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg ml-3 flex items-center justify-center">
                        <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                        <span className="flex items-center">
                          <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {exercise.sets} sets
                        </span>
                        <span className="flex items-center">
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {exercise.reps} reps
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {exercise.restTime}s rest
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {exercise.muscleGroup}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                        {exercise.instructions}
                      </p>
                      <button
                        onClick={() => onSpeakText(`${exercise.name}. ${exercise.instructions}`)}
                        className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                        aria-label="Read exercise instructions"
                      >
                        <Volume2 className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Read instructions</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorkoutPlan;
