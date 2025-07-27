import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PersonalInfoData {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  weight: number;
  height: number;
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'ft-in';
}

interface PersonalInfoStepProps {
  data: Partial<PersonalInfoData>;
  onUpdate: (data: Partial<PersonalInfoData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PersonalInfoStep({ data, onUpdate, onNext, onBack }: PersonalInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof PersonalInfoData, value: any) => {
    onUpdate({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};

    if (!data.name?.trim()) newErrors.name = 'Name is required';
    if (!data.age || data.age < 13 || data.age > 120) newErrors.age = 'Please enter a valid age (13-120)';
    if (!data.gender) newErrors.gender = 'Please select your gender';
    if (!data.weight || data.weight <= 0) newErrors.weight = 'Please enter a valid weight';
    if (!data.height || data.height <= 0) newErrors.height = 'Please enter a valid height';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const ageOptions = Array.from({ length: 88 }, (_, i) => i + 13);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">
            Tell us about yourself
          </h2>
          <p className="text-black">
            This helps us create a personalized fitness plan just for you
          </p>
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={data.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } bg-white text-black`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Age Selection */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Age
            </label>
            <select
              value={data.age || ''}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                errors.age ? 'border-red-500' : 'border-gray-300'
              } bg-white text-black`}
            >
              <option value="">Select your age</option>
              {ageOptions.map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
          </div>

          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Gender
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'male', label: 'Male', icon: '👨' },
                { value: 'female', label: 'Female', icon: '👩' },
                { value: 'non-binary', label: 'Non-binary', icon: '🧑' },
                { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: '❓' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('gender', option.value)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 bg-white ${
                    data.gender === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium text-black">{option.label}</div>
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>

          {/* Weight Input */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-black mb-2">
                Weight
              </label>
              <input
                type="number"
                value={data.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  errors.weight ? 'border-red-500' : 'border-gray-300'
                } bg-white text-black`}
                placeholder="Enter weight"
              />
              {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Unit
              </label>
              <select
                value={data.weightUnit || 'kg'}
                onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-black"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>

          {/* Height Input */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-black mb-2">
                Height
              </label>
              <input
                type="number"
                value={data.height || ''}
                onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  errors.height ? 'border-red-500' : 'border-gray-300'
                } bg-white text-black`}
                placeholder={data.heightUnit === 'cm' ? 'Enter height in cm' : 'Enter height in inches'}
              />
              {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Unit
              </label>
              <select
                value={data.heightUnit || 'cm'}
                onChange={(e) => handleInputChange('heightUnit', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-black"
              >
                <option value="cm">cm</option>
                <option value="ft-in">ft/in</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 text-black hover:text-gray-800 transition-colors duration-200"
          >
            ← Back
          </button>
          <button
            onClick={validateAndNext}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-primary-600 text-white font-semibold rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Continue →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
