import { useState } from 'react';
import { Goal } from '@fitness-app/shared';
import { GoalDetails } from './GoalDetails';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'count': return 'times';
      case 'duration': return 'minutes';
      case 'distance': return 'km';
      case 'weight': return 'kg';
      default: return metric;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'per day';
      case 'weekly': return 'per week';
      case 'monthly': return 'per month';
      default: return frequency;
    }
  };

  // Mock progress calculation for now
  const progress = Math.floor(Math.random() * 100);
  const progressColor = progress >= 75 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : progress >= 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <>
      <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowDetails(true)}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {goal.title}
            </h3>
          {goal.description && (
            <p className="text-gray-600 text-sm mb-2">
              {goal.description}
            </p>
          )}
          <div className="text-sm text-gray-500">
            Target: {goal.target} {getMetricLabel(goal.metric)} {getFrequencyLabel(goal.frequency)}
          </div>
        </div>
        
        <div className="flex space-x-2 ml-4">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(goal);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(goal.id);
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-between items-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          goal.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {goal.isActive ? 'Active' : 'Inactive'}
        </span>
        
        <div className="text-xs text-gray-500">
          Created: {new Date(goal.createdAt).toLocaleDateString()}
        </div>
      </div>
      </div>

      {/* Goal Details Modal */}
      {showDetails && (
        <GoalDetails
          goalId={goal.id}
          onClose={() => setShowDetails(false)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
