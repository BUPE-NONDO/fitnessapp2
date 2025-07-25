import { OnboardingData } from '../OnboardingWizard';

interface WelcomeStepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const testimonials = [
    {
      name: "Sarah M.",
      result: "Lost 15 lbs in 8 weeks",
      image: "👩‍💼",
      quote: "This app changed my life! The personalized plan was exactly what I needed."
    },
    {
      name: "Mike R.",
      result: "Gained 10 lbs muscle",
      image: "👨‍💻",
      quote: "Finally found a program that fits my busy schedule and delivers results."
    },
    {
      name: "Jessica L.",
      result: "Improved flexibility 200%",
      image: "👩‍🎨",
      quote: "The variety of workouts keeps me motivated and engaged every day."
    }
  ];

  const stats = [
    { number: "100K+", label: "Active Users" },
    { number: "4.8★", label: "App Rating" },
    { number: "85%", label: "Success Rate" },
    { number: "30 Days", label: "Money Back" }
  ];

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Build Your
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {" "}Perfect Body
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Get a personalized fitness plan designed specifically for your goals, 
            lifestyle, and fitness level. Join thousands who've transformed their lives.
          </p>
        </div>

        {/* Hero Image/Illustration */}
        <div className="mb-8">
          <div className="relative mx-auto w-64 h-64 md:w-80 md:h-80">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-primary-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-4 bg-gradient-to-r from-purple-500 to-primary-600 rounded-full opacity-30 animate-pulse delay-75"></div>
            <div className="absolute inset-8 bg-gradient-to-r from-purple-600 to-primary-700 rounded-full opacity-40 animate-pulse delay-150"></div>
            <div className="absolute inset-0 flex items-center justify-center text-6xl md:text-8xl">
              💪
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onNext}
          className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-primary-600 rounded-2xl hover:from-purple-700 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-circle-lg hover:shadow-glow"
        >
          Start Your 2-Minute Quiz
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          ⏱️ Takes less than 2 minutes • 🔒 100% Free to start
        </p>
      </div>

      {/* Social Proof Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stat.number}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Join Thousands of Success Stories
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-3">{testimonial.image}</div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                {testimonial.result}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                "{testimonial.quote}"
              </p>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {testimonial.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Signals */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            No Equipment Required
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Scientifically Proven
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            30-Day Guarantee
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Cancel Anytime
          </div>
        </div>
      </div>

      {/* Secondary CTA */}
      <div className="text-center">
        <button
          onClick={onNext}
          className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Get My Personalized Plan
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
