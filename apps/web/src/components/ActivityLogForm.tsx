import { useState } from 'react';
import { Goal, CreateLogEntry } from '@fitness-app/shared';

interface ActivityLogFormProps {
  goals: Goal[];
  onSubmit: (logData: CreateLogEntry) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ActivityLogForm({ goals, onSubmit, onCancel, isLoading }: ActivityLogFormProps) {
  const [formData, setFormData] = useState<CreateLogEntry>({
    goalId: goals[0]?.id || '',
    date: new Date(),
    value: 0,
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<CreateLogEntry>>({});

  const selectedGoal = goals.find(g => g.id === formData.goalId);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateLogEntry> = {};

    if (!formData.goalId) {
      newErrors.goalId = 'Please select a goal';
    }

    if (formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0';
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes must be 500 characters or less';
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

  const handleInputChange = (field: keyof CreateLogEntry, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'count': return 'times';
      case 'duration': return 'minutes';
      case 'distance': return 'km';
      case 'weight': return 'kg';
      default: return metric;
    }
  };

  if (goals.length === 0) {
    return (
      <div className="card max-w-md mx-auto text-center py-8">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Goals Available
        </h3>
        <p className="text-gray-600 mb-4">
          You need to create at least one goal before logging activities.
        </p>
        <button onClick={onCancel} className="btn btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="card max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Log Activity
        </h2>
        <p className="text-gray-600 mt-1">
          Record your progress towards your fitness goals
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Selection */}
        <div>
          <label htmlFor="goalId" className="block text-sm font-medium text-gray-700 mb-1">
            Select Goal *
          </label>
          <select
            id="goalId"
            value={formData.goalId}
            onChange={(e) => handleInputChange('goalId', e.target.value)}
            className={`input ${errors.goalId ? 'border-red-500' : ''}`}
          >
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title} (Target: {goal.target} {getMetricLabel(goal.metric)})
              </option>
            ))}
          </select>
          {errors.goalId && (
            <p className="text-red-600 text-sm mt-1">{errors.goalId}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            id="date"
            type="date"
            value={formData.date.toISOString().split('T')[0]}
            onChange={(e) => handleInputChange('date', new Date(e.target.value))}
            className="input"
            max={new Date().toISOString().split('T')[0]} // Can't log future activities
          />
        </div>

        {/* Value */}
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
            Value ({selectedGoal ? getMetricLabel(selectedGoal.metric) : 'units'}) *
          </label>
          <input
            id="value"
            type="number"
            min="0.1"
            step="0.1"
            value={formData.value}
            onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
            className={`input ${errors.value ? 'border-red-500' : ''}`}
            placeholder={`e.g., ${selectedGoal?.target || 10}`}
          />
          {errors.value && (
            <p className="text-red-600 text-sm mt-1">{errors.value}</p>
          )}
          {selectedGoal && (
            <p className="text-sm text-gray-500 mt-1">
              Goal target: {selectedGoal.target} {getMetricLabel(selectedGoal.metric)} {selectedGoal.frequency}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className={`input ${errors.notes ? 'border-red-500' : ''}`}
            placeholder="How did it go? Any observations..."
            rows={3}
            maxLength={500}
          />
          {errors.notes && (
            <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formData.notes?.length || 0}/500 characters
          </p>
        </div>

        {/* Progress Preview */}
        {selectedGoal && formData.value > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              📊 Progress Preview
            </h4>
            <div className="text-sm text-blue-700">
              <p>
                <strong>{formData.value}</strong> {getMetricLabel(selectedGoal.metric)} towards 
                <strong> {selectedGoal.target}</strong> {getMetricLabel(selectedGoal.metric)} goal
              </p>
              <p className="mt-1">
                Progress: <strong>{Math.round((formData.value / selectedGoal.target) * 100)}%</strong>
                {formData.value >= selectedGoal.target && (
                  <span className="text-green-600 ml-2">🎉 Goal achieved!</span>
                )}
              </p>
            </div>
          </div>
        )}

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
                Logging...
              </span>
            ) : (
              'Log Activity'
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
