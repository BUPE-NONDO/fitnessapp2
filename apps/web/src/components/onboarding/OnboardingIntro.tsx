import { useState, useEffect } from 'react';

interface OnboardingIntroProps {
  isVisible: boolean;
  onStart: () => void;
  onSkip: () => void;
  userName?: string;
}

export function OnboardingIntro({ 
  isVisible, 
  onStart, 
  onSkip, 
  userName 
}: OnboardingIntroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      id: 'welcome',
      title: `Welcome${userName ? `, ${userName}` : ''}!`,
      subtitle: 'Ready to transform your fitness journey?',
      illustration: '🎯',
      features: [
        { icon: '📊', title: 'Track Progress', desc: 'Monitor your fitness journey with detailed analytics' },
        { icon: '🎯', title: 'Set Goals', desc: 'Create personalized fitness goals that motivate you' },
        { icon: '🏆', title: 'Earn Rewards', desc: 'Unlock achievements and celebrate milestones' }
      ]
    },
    {
      id: 'personalized',
      title: 'Get a fitness plan tailored to your goals',
      subtitle: 'and lifestyle',
      illustration: '🎨',
      features: [
        { icon: '🏋️', title: 'Custom Workouts', desc: 'Exercises matched to your fitness level and available equipment' },
        { icon: '📅', title: 'Flexible Schedule', desc: 'Workouts that fit your busy lifestyle and time constraints' },
        { icon: '🎯', title: 'Goal-Focused', desc: 'Every exercise designed to help you reach your specific goals' }
      ]
    },
    {
      id: 'community',
      title: 'Join the Community',
      subtitle: 'Connect with others on their fitness journey',
      illustration: '👥',
      features: [
        { icon: '🤝', title: 'Find Motivation', desc: 'Get inspired by others achieving their goals' },
        { icon: '📈', title: 'Share Progress', desc: 'Celebrate your wins with the community' },
        { icon: '💪', title: 'Stay Accountable', desc: 'Keep each other motivated and on track' }
      ]
    }
  ];

  useEffect(() => {
    if (!isVisible || !isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isVisible, isAutoPlaying, slides.length]);

  if (!isVisible) return null;

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="relative flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">F</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">FitnessApp</span>
        </div>

        <button
          onClick={onSkip}
          className="px-4 py-2 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium"
        >
          Skip
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Slide Content */}
          <div className="text-center mb-12">
            <div className="text-8xl mb-6 animate-bounce">
              {currentSlideData.illustration}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {currentSlideData.title}
              {currentSlideData.id === 'personalized' && (
                <span className="text-purple-600 dark:text-purple-400"> {currentSlideData.subtitle}</span>
              )}
            </h1>
            {currentSlideData.id !== 'personalized' && (
              <p className="text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto font-medium">
                {currentSlideData.subtitle}
              </p>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {currentSlideData.features.map((feature, index) => (
              <div
                key={feature.title}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transform transition-all duration-500 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onStart}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              <span className="mr-2">🚀</span>
              Start Your Journey
            </button>
            <button
              onClick={onSkip}
              className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-800 dark:text-gray-100 font-semibold rounded-xl transition-all duration-200"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setIsAutoPlaying(false);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-blue-500 w-8'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
        
        {/* Auto-play control */}
        <div className="flex justify-center mt-3">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors font-medium"
          >
            {isAutoPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default OnboardingIntro;
