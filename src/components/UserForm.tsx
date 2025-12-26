import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '../types';
import { User, Activity, MapPin, Utensils } from 'lucide-react';

interface UserFormProps {
  onSubmit: (profile: UserProfile) => void;
  loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    age: 0,
    gender: '',
    height: 0,
    weight: 0,
    fitnessGoal: '',
    fitnessLevel: '',
    workoutLocation: '',
    dietaryPreference: '',
    medicalHistory: '',
    stressLevel: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-gray-800 dark:text-white">
        Create Your Fitness Profile
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age || ''}
              onChange={handleChange}
              min="16"
              max="100"
              required
              placeholder="Enter your age"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              name="height"
              value={formData.height || ''}
              onChange={handleChange}
              min="100"
              max="250"
              required
              placeholder="Enter your height in cm"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight || ''}
              onChange={handleChange}
              min="30"
              max="200"
              required
              placeholder="Enter your weight in kg"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Activity className="inline w-4 h-4 mr-2" />
              Fitness Goal
            </label>
            <select
              name="fitnessGoal"
              value={formData.fitnessGoal}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
            >
              <option value="weight_loss">Weight Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="endurance">Endurance</option>
              <option value="general_fitness">General Fitness</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fitness Level
            </label>
            <select
              name="fitnessLevel"
              value={formData.fitnessLevel}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline w-4 h-4 mr-2" />
              Workout Location
            </label>
            <select
              name="workoutLocation"
              value={formData.workoutLocation}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
            >
              <option value="home">Home</option>
              <option value="gym">Gym</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Utensils className="inline w-4 h-4 mr-2" />
              Dietary Preference
            </label>
            <select
              name="dietaryPreference"
              value={formData.dietaryPreference}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
            >
              <option value="omnivore">Omnivore</option>
              <option value="non-vegetarian">Non-Vegetarian</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
              <option value="paleo">Paleo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stress Level
            </label>
            <select
              name="stressLevel"
              value={formData.stressLevel}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Medical History (optional)
          </label>
          <textarea
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            rows={3}
            placeholder="Any medical conditions or injuries we should know about..."
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 sm:px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? 'Generating Plan...' : 'Generate Fitness Plan'}
        </button>
      </form>
    </motion.div>
  );
};

export default UserForm;
