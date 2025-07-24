import { useState } from 'react';
import { Goal, CreateGoal } from '@fitness-app/shared';

interface GoalFormProps {
  goal?: Goal;
  onSubmit: (goalData: CreateGoal) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GoalForm({ goal, onSubmit, onCancel, isLoading }: GoalFormProps) {
  const [formData, setFormData] = useState<CreateGoal>({
    title: goal?.title || '',
    description: goal?.description || '',
    metric: goal?.metric || 'count',
    target: goal?.target || 1,
    frequency: goal?.frequency || 'daily',
  });

  const [errors, setErrors] = useState<Partial<CreateGoal>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateGoal> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    if (formData.target <= 0) {
      newErrors.target = 'Target must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CreateGoal, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {goal ? 'Edit Goal' : 'Create New Goal'}
        </h2>
        <p className="text-gray-600 mt-1">
          {goal ? 'Update your fitness goal' : 'Set a new fitness goal to track your progress'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Goal Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`input ${errors.title ? 'border-red-500' : ''}`}
            placeholder="e.g., Daily Push-ups"
            maxLength={100}
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`input ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Describe your goal..."
            rows={3}
            maxLength={500}
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Metric */}
        <div>
          <label htmlFor="metric" className="block text-sm font-medium text-gray-700 mb-1">
            Metric Type *
          </label>
          <select
            id="metric"
            value={formData.metric}
            onChange={(e) => handleInputChange('metric', e.target.value as any)}
            className="input"
          >
            <option value="count">Count (times)</option>
            <option value="duration">Duration (minutes)</option>
            <option value="distance">Distance (km)</option>
            <option value="weight">Weight (kg)</option>
          </select>
        </div>

        {/* Target */}
        <div>
          <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
            Target Value *
          </label>
          <input
            id="target"
            type="number"
            min="0.1"
            step="0.1"
            value={formData.target}
            onChange={(e) => handleInputChange('target', parseFloat(e.target.value) || 0)}
            className={`input ${errors.target ? 'border-red-500' : ''}`}
            placeholder="e.g., 50"
          />
          {errors.target && (
            <p className="text-red-600 text-sm mt-1">{errors.target}</p>
          )}
        </div>

        {/* Frequency */}
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
            Frequency *
          </label>
          <select
            id="frequency"
            value={formData.frequency}
            onChange={(e) => handleInputChange('frequency', e.target.value as any)}
            className="input"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {goal ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              goal ? 'Update Goal' : 'Create Goal'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary flex-1"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
