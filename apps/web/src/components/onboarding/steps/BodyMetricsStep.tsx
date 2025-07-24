import { useState } from 'react';
import { OnboardingData } from '../OnboardingWizard';

interface BodyMetricsStepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}

export function BodyMetricsStep({ data, onUpdate }: BodyMetricsStepProps) {
  const [currentWeight, setCurrentWeight] = useState(data.currentWeight || '');
  const [targetWeight, setTargetWeight] = useState(data.targetWeight || '');
  const [height, setHeight] = useState(data.height || '');

  const handleUpdate = (field: string, value: any) => {
    const updates = { [field]: value };
    onUpdate(updates);
  };

  const calculateBMI = () => {
    if (currentWeight && height) {
      const weightKg = typeof currentWeight === 'string' ? parseFloat(currentWeight) : currentWeight;
      const heightM = (typeof height === 'string' ? parseFloat(height) : height) / 100;
      return (weightKg / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Let's get your measurements
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          This helps us track your progress and set realistic goals.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Weight (kg)
          </label>
          <input
            type="number"
            value={currentWeight}
            onChange={(e) => {
              setCurrentWeight(e.target.value);
              handleUpdate('currentWeight', parseFloat(e.target.value));
              handleUpdate('weightUnit', 'kg');
            }}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="70"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Weight (kg)
          </label>
          <input
            type="number"
            value={targetWeight}
            onChange={(e) => {
              setTargetWeight(e.target.value);
              handleUpdate('targetWeight', parseFloat(e.target.value));
            }}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="65"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Height (cm)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => {
              setHeight(e.target.value);
              handleUpdate('height', parseFloat(e.target.value));
              handleUpdate('heightUnit', 'cm');
            }}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="170"
          />
        </div>

        {calculateBMI() && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                BMI: {calculateBMI()}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                Normal range: 18.5 - 24.9
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
