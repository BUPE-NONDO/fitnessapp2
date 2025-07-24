import { OnboardingData } from '../OnboardingWizard';

interface PlanSummaryStepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}

export function PlanSummaryStep({ data }: PlanSummaryStepProps) {
  const plan = data.personalizedPlan;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Your Personalized Plan is Ready!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Based on your goals and preferences, we've created the perfect fitness plan for you.
        </p>
      </div>

      {plan && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your {plan.duration}-Week Transformation Plan
            </h2>
            <div className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
              Expected Result: {plan.projectedResults.weightChange > 0 ? '+' : ''}{plan.projectedResults.weightChange}kg in {plan.projectedResults.timeframe} weeks
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Weekly Schedule</h3>
              <div className="space-y-3">
                {plan.weeklySchedule.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium">{day.day}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{day.workoutType}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{day.duration} min</div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        day.intensity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        day.intensity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {day.intensity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">What's Included</h3>
              <div className="space-y-3">
                {[
                  'Personalized workout routines',
                  'Progress tracking tools',
                  'Nutrition guidance',
                  'Video exercise demonstrations',
                  'Weekly progress reports',
                  '24/7 support community'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Ready to Start Your Transformation?
          </h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Unlock your full plan and start seeing results in just days!
          </p>
        </div>
      </div>
    </div>
  );
}
