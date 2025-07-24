import { useState } from 'react';
import { Goal, CreateGoal } from '@fitness-app/shared';
import { useGoals, useCreateGoal } from '@/hooks/useTRPC';
import { GoalCard } from './GoalCard';
import { GoalForm } from './GoalForm';
import { achievementService } from '@/services/achievementService';
import { useUser } from '@/hooks/useUser';

export function GoalsList() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { user } = useUser();

  const { data: goalsResponse, isLoading, isError } = useGoals();
  const createGoalMutation = useCreateGoal();

  // Mock goals data for now since we're using mock tRPC
  const mockGoals: Goal[] = [
    {
      id: '1',
      userId: 'user1',
      title: 'Daily Push-ups',
      description: 'Build upper body strength with daily push-ups',
      metric: 'count',
      target: 50,
      frequency: 'daily',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      userId: 'user1',
      title: 'Weekly Running',
      description: 'Improve cardiovascular health',
      metric: 'distance',
      target: 10,
      frequency: 'weekly',
      isActive: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '3',
      userId: 'user1',
      title: 'Monthly Weight Loss',
      description: 'Lose weight gradually and sustainably',
      metric: 'weight',
      target: 2,
      frequency: 'monthly',
      isActive: true,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
  ];

  const goals = goalsResponse?.data || mockGoals;

  const handleCreateGoal = async (goalData: CreateGoal) => {
    try {
      console.log('Creating goal with data:', goalData);
      const result = await createGoalMutation.mutateAsync(goalData);
      console.log('Goal created successfully:', result);
      setShowForm(false);

      // Check for achievements after creating a goal
      if (user) {
        setTimeout(() => {
          achievementService.checkForNewAchievements(user.uid);
        }, 1000); // Small delay to ensure goal is saved
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
      // Show user-friendly error message
      alert(`Failed to create goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleUpdateGoal = async (goalData: CreateGoal) => {
    if (!editingGoal) return;
    
    try {
      // In a real implementation, this would call an update mutation
      console.log('Goal updated:', { id: editingGoal.id, ...goalData });
      setShowForm(false);
      setEditingGoal(null);
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        // In a real implementation, this would call a delete mutation
        console.log('Goal deleted:', goalId);
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  if (showForm) {
    return (
      <GoalForm
        goal={editingGoal || undefined}
        onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
        onCancel={handleCancelForm}
        isLoading={createGoalMutation.isLoading}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Goals</h2>
          <p className="text-gray-600 mt-1">
            Track your fitness goals and monitor your progress
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          + New Goal
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading goals...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="card bg-red-50 border-red-200">
          <div className="text-center py-4">
            <div className="text-red-600 text-4xl mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Failed to Load Goals
            </h3>
            <p className="text-red-700">
              There was an error loading your goals. Please try again later.
            </p>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {!isLoading && !isError && (
        <>
          {goals.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Goals Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first fitness goal to start tracking your progress!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Stats Summary */}
      {!isLoading && !isError && goals.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Goals Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{goals.length}</div>
              <div className="text-sm text-gray-600">Total Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {goals.filter(g => g.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {goals.filter(g => g.frequency === 'daily').length}
              </div>
              <div className="text-sm text-gray-600">Daily Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {goals.filter(g => g.frequency === 'weekly').length}
              </div>
              <div className="text-sm text-gray-600">Weekly Goals</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
