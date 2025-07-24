import { useState } from 'react';
import { Goal } from '@fitness-app/shared';
import { GoalDetails } from './GoalDetails';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { cn, getTypography } from '@/styles/design-system';

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

  const getStatusVariant = (isActive: boolean): 'success' | 'neutral' => {
    return isActive ? 'success' : 'neutral';
  };

  const getProgressVariant = (progress: number): 'success' | 'primary' | 'warning' | 'error' => {
    if (progress >= 100) return 'success';
    if (progress >= 75) return 'primary';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Mock progress calculation for now
  const progress = Math.floor(Math.random() * 100);

  return (
    <>
      <Card variant="interactive" onClick={() => setShowDetails(true)}>
        <Card.Header>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Card.Title className={getTypography('h4')}>
                {goal.title}
              </Card.Title>
              {goal.description && (
                <p className={cn(getTypography('body'), 'mt-1')}>
                  {goal.description}
                </p>
              )}
              <div className={cn(getTypography('caption'), 'mt-2')}>
                Target: {goal.target} {getMetricLabel(goal.metric)} {getFrequencyLabel(goal.frequency)}
              </div>
            </div>
            <Badge variant={getStatusVariant(goal.isActive)}>
              {goal.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </Card.Header>

        <Card.Content>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={cn(getTypography('label'), 'text-sm')}>Progress</span>
              <Badge variant={getProgressVariant(progress)} size="sm">
                {progress}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  getProgressColor(progress)
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </Card.Content>

        <Card.Footer>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(goal);
                  }}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  }
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(goal.id);
                  }}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  }
                >
                  Delete
                </Button>
              )}
            </div>

            <div className={cn(getTypography('caption'), 'text-xs')}>
              Created: {new Date(goal.createdAt).toLocaleDateString()}
            </div>
          </div>
        </Card.Footer>
      </Card>

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
