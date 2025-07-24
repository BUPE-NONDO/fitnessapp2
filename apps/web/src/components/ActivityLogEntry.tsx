import { LogEntry, Goal } from '@fitness-app/shared';

interface ActivityLogEntryProps {
  logEntry: LogEntry;
  goal?: Goal;
  onEdit?: (logEntry: LogEntry) => void;
  onDelete?: (logEntryId: string) => void;
}

export function ActivityLogEntry({ logEntry, goal, onEdit, onDelete }: ActivityLogEntryProps) {
  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'count': return 'times';
      case 'duration': return 'minutes';
      case 'distance': return 'km';
      case 'weight': return 'kg';
      default: return metric;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    if (!goal) return 0;
    return Math.min(Math.round((logEntry.value / goal.target) * 100), 100);
  };

  const progressPercentage = getProgressPercentage();
  const isGoalAchieved = goal && logEntry.value >= goal.target;

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {goal?.title || 'Unknown Goal'}
            </h3>
            {isGoalAchieved && (
              <span className="text-green-600 text-xl">🎉</span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {formatDate(logEntry.date)}
          </p>
        </div>
        
        <div className="flex space-x-2 ml-4">
          {onEdit && (
            <button
              onClick={() => onEdit(logEntry)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(logEntry.id)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Value and Progress */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-primary-600">
            {logEntry.value}
          </span>
          <span className="text-sm text-gray-600">
            {goal ? getMetricLabel(goal.metric) : 'units'}
          </span>
        </div>
        
        {goal && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-700">
                Target: {goal.target} {getMetricLabel(goal.metric)}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isGoalAchieved 
                    ? 'bg-green-500' 
                    : progressPercentage >= 75 
                      ? 'bg-blue-500' 
                      : progressPercentage >= 50 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {logEntry.notes && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
            {logEntry.notes}
          </p>
        </div>
      )}

      {/* Achievement Badge */}
      {isGoalAchieved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <span className="text-green-600 text-lg mr-2">🏆</span>
            <div>
              <p className="text-sm font-medium text-green-900">
                Goal Achieved!
              </p>
              <p className="text-xs text-green-700">
                You reached your target of {goal.target} {getMetricLabel(goal.metric)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
        <span>
          Logged: {new Date(logEntry.createdAt).toLocaleDateString()}
        </span>
        {logEntry.updatedAt && logEntry.updatedAt !== logEntry.createdAt && (
          <span>
            Updated: {new Date(logEntry.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
