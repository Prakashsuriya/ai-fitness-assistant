import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';

interface HistoryItem {
  userProfile: any;
  fitnessPlan: any;
  timestamp: string;
  isSaved: boolean;
}

interface HistoryProps {
  history: HistoryItem[];
  onSelectPlan: (plan: HistoryItem) => void;
  onBack: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onSelectPlan, onBack }) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Clock className="w-6 h-6 mr-2 text-blue-600" />
            Plan History
          </h2>
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No history found. Generate some plans to see them here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onSelectPlan(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {item.userProfile.name}'s Fitness Plan
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(item.timestamp)}
                        </span>
                        <span className="flex items-center">
                          {item.isSaved ? (
                            <span className="text-green-600 font-medium">Saved</span>
                          ) : (
                            <span className="text-blue-600 font-medium">Generated</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {item.fitnessPlan.workoutPlan?.length || 7} days
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Click to view
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default History;
