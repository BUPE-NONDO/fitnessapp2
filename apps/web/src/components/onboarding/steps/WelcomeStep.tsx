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
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        {/* Professional Header */}
        <div className="mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-50 to-violet-50 dark:from-cyan-900/20 dark:to-violet-900/20 rounded-full border border-cyan-200 dark:border-cyan-800 mb-6">
            <span className="bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent dark:from-cyan-400 dark:to-violet-400 text-sm font-medium">🎯 Personalized Just for You</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight">
            Get a fitness plan tailored to your goals
            <span className="block text-transparent bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 bg-clip-text">
              and lifestyle
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-black max-w-3xl mx-auto leading-relaxed mb-8">
            Join thousands who've transformed their lives with science-backed,
            personalized workout plans that actually fit your schedule.
          </p>
        </div>

        {/* Professional Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🏋️</span>
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">Custom Workouts</h3>
            <p className="text-black">Exercises matched to your fitness level and available equipment</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">Flexible Schedule</h3>
            <p className="text-black">Workouts that fit your busy lifestyle and time constraints</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">Goal-Focused</h3>
            <p className="text-black">Every exercise designed to help you reach your specific goals</p>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="mb-8">
          <button
            onClick={onNext}
            className="inline-flex items-center px-10 py-5 text-xl font-semibold text-white bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 rounded-2xl hover:from-cyan-700 hover:via-violet-700 hover:to-fuchsia-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25"
          >
            Start Your 2-Minute Assessment
            <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <p className="text-base text-gray-600 mt-4 flex items-center justify-center gap-4">
            <span className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Takes 2 minutes
            </span>
            <span className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% Free
            </span>
            <span className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No equipment needed
            </span>
          </p>
        </div>
      </div>

      {/* Social Proof Stats */}
      <div className="bg-gradient-to-r from-cyan-50 to-violet-50 dark:from-cyan-900/20 dark:to-violet-900/20 rounded-3xl p-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Real Results from Real People
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Join thousands who've achieved their fitness goals with personalized plans
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center text-xl mr-4">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {testimonial.result}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex text-yellow-400 mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 rounded-3xl p-12 text-center text-white">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Transform Your Life?
        </h3>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Get your personalized fitness plan in just 2 minutes. No equipment required, no gym membership needed.
        </p>

        <button
          onClick={onNext}
          className="inline-flex items-center px-10 py-5 text-xl font-semibold bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent bg-white rounded-2xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-2xl"
        >
          Start My Free Assessment
          <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <p className="text-sm mt-4 opacity-75">
          Join 100,000+ people who've already started their fitness journey
        </p>
      </div>
    </div>
  );
}
