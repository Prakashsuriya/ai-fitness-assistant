import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserForm from './components/UserForm';
import WeeklyPlan from './components/WeeklyPlan';
import History from './components/History';
import { UserProfile, FitnessPlan } from './types';
import { ApiService } from './services/api';
import { Download, Moon, Sun, RefreshCw, Sparkles, Save, FolderOpen, History as HistoryIcon } from 'lucide-react';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMotivationIndex, setCurrentMotivationIndex] = useState(0);
  const [savedPlansCount, setSavedPlansCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    // Load counts on mount
    const savedPlans = localStorage.getItem('savedFitnessPlans');
    if (savedPlans) {
      const plans = JSON.parse(savedPlans);
      setSavedPlansCount(plans.length);
    }
    
    const historyPlans = localStorage.getItem('fitnessHistory');
    if (historyPlans) {
      const plans = JSON.parse(historyPlans);
      setHistoryCount(plans.length);
    }
  }, []);

  const handleFormSubmit = async (profile: UserProfile) => {
    setLoading(true);
    setError(null);
    
    try {
      const plan = await ApiService.generateFitnessPlan(profile);
      setFitnessPlan(plan);
      setUserProfile(profile);
      
      // Add to history automatically
      const historyPlans = localStorage.getItem('fitnessHistory');
      const plans = historyPlans ? JSON.parse(historyPlans) : [];
      plans.push({
        userProfile: profile,
        fitnessPlan: plan,
        timestamp: new Date().toISOString(),
        isSaved: false
      });
      localStorage.setItem('fitnessHistory', JSON.stringify(plans));
      setHistoryCount(plans.length);
      
    } catch (err) {
      setError('Failed to generate fitness plan. Please try again.');
      console.error('Error generating plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const savePlanToLocalStorage = () => {
    if (fitnessPlan && userProfile) {
      const planData = {
        userProfile,
        fitnessPlan,
        timestamp: new Date().toISOString()
      };
      
      // Get existing saved plans
      const existingPlans = localStorage.getItem('savedFitnessPlans');
      const plans = existingPlans ? JSON.parse(existingPlans) : [];
      
      // Add new plan
      plans.push(planData);
      
      // Save updated plans
      localStorage.setItem('savedFitnessPlans', JSON.stringify(plans));
      setSavedPlansCount(plans.length);
      
      // Update history to mark this plan as saved
      const historyPlans = localStorage.getItem('fitnessHistory');
      if (historyPlans) {
        const history = JSON.parse(historyPlans);
        const currentPlanIndex = history.findIndex((p: any) => 
          p.userProfile.name === userProfile.name && 
          p.timestamp === fitnessPlan.generatedAt?.toISOString()
        );
        if (currentPlanIndex !== -1) {
          history[currentPlanIndex].isSaved = true;
          localStorage.setItem('fitnessHistory', JSON.stringify(history));
        }
      }
      
      alert('Plan saved successfully!');
    } else {
      alert('No plan to save. Please generate a plan first.');
    }
  };

  const viewSavedPlans = () => {
    const savedPlans = localStorage.getItem('savedFitnessPlans');
    if (savedPlans && JSON.parse(savedPlans).length > 0) {
      const plans = JSON.parse(savedPlans);
      const planList = plans.map((p: any, index: number) => 
        `${index + 1}. ${p.userProfile.name} - ${new Date(p.timestamp).toLocaleDateString()}`
      ).join('\n');
      alert(`Saved Plans (${plans.length}):\n${planList}`);
    } else {
      alert('No saved plans found.');
    }
  };

  const viewHistory = () => {
    const historyPlans = localStorage.getItem('fitnessHistory');
    if (historyPlans && JSON.parse(historyPlans).length > 0) {
      const plans = JSON.parse(historyPlans);
      setHistoryData(plans);
      setShowHistory(true);
    } else {
      alert('No history found.');
    }
  };

  const handleSelectHistoryPlan = (item: any) => {
    setUserProfile(item.userProfile);
    setFitnessPlan(item.fitnessPlan);
    setCurrentMotivationIndex(0);
    setShowHistory(false);
  };

  const handleBackFromHistory = () => {
    setShowHistory(false);
  };

  const loadPlanFromLocalStorage = () => {
    const savedPlan = localStorage.getItem('fitnessPlan');
    if (savedPlan) {
      const planData = JSON.parse(savedPlan);
      setUserProfile(planData.userProfile);
      setFitnessPlan(planData.fitnessPlan);
      setCurrentMotivationIndex(0);
    } else {
      alert('No saved plan found.');
    }
  };

  const handleRegeneratePlan = () => {
  // Clear current plan to redirect to user form
  setFitnessPlan(null);
  setUserProfile(null);
  setError(null);
};

  const handleRegenerateMotivation = () => {
    if (fitnessPlan) {
      setCurrentMotivationIndex((prev) => (prev + 1) % fitnessPlan.motivationTips.length);
    }
  };

  const hasSavedPlan = () => {
    const savedPlans = localStorage.getItem('savedFitnessPlans');
    return savedPlans && JSON.parse(savedPlans).length > 0;
  };

  const themeIcon = darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-green-50'}`}>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 px-4"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            <Sparkles className="inline w-6 h-6 sm:w-8 sm:h-8 mr-2 text-blue-600" />
            <span className="block sm:inline">AI Fitness Assistant</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Your personalized workout and nutrition planner
          </p>
        </motion.header>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 px-2 no-print">
          <button
            onClick={toggleDarkMode}
            className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            aria-label="Toggle dark mode"
          >
            {themeIcon}
          </button>
          
                    
          <button
            onClick={viewHistory}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            <HistoryIcon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">History ({historyCount})</span>
            <span className="sm:hidden">Hist ({historyCount})</span>
          </button>
          
          {fitnessPlan && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleRegeneratePlan}
                disabled={loading}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Regenerate</span>
                <span className="sm:hidden">Regen</span>
              </button>
              
              <button
                onClick={handleExportPDF}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">Export</span>
              </button>
              
              <button
                onClick={savePlanToLocalStorage}
                disabled={!fitnessPlan || !userProfile}
                className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Save Plan</span>
                <span className="sm:hidden">Save</span>
              </button>
              
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto mb-6 p-4 bg-red-100 border border-red-300 rounded-lg"
          >
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {showHistory ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <History 
                history={historyData} 
                onSelectPlan={handleSelectHistoryPlan} 
                onBack={handleBackFromHistory} 
              />
            </motion.div>
          ) : !fitnessPlan ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <UserForm onSubmit={handleFormSubmit} loading={loading} />
            </motion.div>
          ) : (
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-12"
            >
              {/* User Welcome */}
              {userProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-4xl mx-auto px-4"
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                      {userProfile.name}'s Fitness Plan
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                      Personalized plan for {userProfile.age} year old {userProfile.gender} • {userProfile.fitnessGoal} goal
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Motivation Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 text-center">
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3">
                    Daily Motivation
                  </h3>
                  <div className="mb-4">
                    <motion.p
                      key={currentMotivationIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-purple-700 dark:text-purple-300 italic text-lg"
                    >
                      "{fitnessPlan.motivationTips[currentMotivationIndex]}"
                    </motion.p>
                  </div>
                  <button
                    onClick={handleRegenerateMotivation}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    New Motivation
                  </button>
                </div>
              </motion.div>

              {/* Weekly Plan */}
              <WeeklyPlan fitnessPlan={fitnessPlan} onSpeakText={handleSpeakText} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
