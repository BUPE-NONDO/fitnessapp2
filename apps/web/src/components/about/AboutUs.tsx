import React from 'react';

interface AboutUsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutUs({ isOpen, onClose }: AboutUsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">About FitnessApp</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-white/90 space-y-8">
          {/* Mission Section */}
          <section className="text-center space-y-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">💪</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Your Personal Fitness Journey</h3>
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              FitnessApp is designed to make fitness accessible, personalized, and enjoyable for everyone. 
              We believe that everyone deserves the tools and guidance to achieve their health and wellness goals.
            </p>
          </section>

          {/* Developer Section */}
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">BN</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-white mb-2">Bupe Nondo</h4>
                <p className="text-white/80 mb-2">Lead Developer & Fitness Enthusiast</p>
                <p className="text-sm text-white/70 leading-relaxed">
                  Passionate about creating technology that empowers people to live healthier lives. 
                  With a background in software development and a personal commitment to fitness, 
                  Bupe brings both technical expertise and real-world fitness experience to FitnessApp.
                </p>
              </div>
            </div>
          </section>

          {/* Organization Section */}
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto shadow-lg">
                <span className="text-2xl font-bold text-white">H</span>
              </div>
              <h4 className="text-xl font-bold text-white">Hytel Organization</h4>
              <p className="text-white/80 max-w-2xl mx-auto leading-relaxed">
                Hytel is a forward-thinking technology organization dedicated to developing innovative solutions 
                that improve people's daily lives. We focus on creating user-centric applications that combine 
                cutting-edge technology with practical, real-world benefits.
              </p>
            </div>
          </section>

          {/* Features Section */}
          <section className="space-y-6">
            <h4 className="text-xl font-bold text-white text-center">What Makes FitnessApp Special</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎯</span>
                  <h5 className="font-semibold text-white">Personalized Plans</h5>
                </div>
                <p className="text-sm text-white/80 ml-11">
                  AI-powered workout plans tailored to your fitness level, goals, and preferences.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <h5 className="font-semibold text-white">Progress Tracking</h5>
                </div>
                <p className="text-sm text-white/80 ml-11">
                  Comprehensive analytics to monitor your fitness journey and celebrate achievements.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏆</span>
                  <h5 className="font-semibold text-white">Achievement System</h5>
                </div>
                <p className="text-sm text-white/80 ml-11">
                  Gamified experience with badges, milestones, and rewards to keep you motivated.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔒</span>
                  <h5 className="font-semibold text-white">Privacy First</h5>
                </div>
                <p className="text-sm text-white/80 ml-11">
                  Your data is secure and private. We never share your personal information.
                </p>
              </div>
            </div>
          </section>

          {/* Technology Section */}
          <section className="space-y-4">
            <h4 className="text-xl font-bold text-white text-center">Built with Modern Technology</h4>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: 'React', icon: '⚛️' },
                { name: 'TypeScript', icon: '📘' },
                { name: 'Firebase', icon: '🔥' },
                { name: 'Tailwind CSS', icon: '🎨' },
                { name: 'tRPC', icon: '🚀' },
                { name: 'Vite', icon: '⚡' }
              ].map((tech) => (
                <div key={tech.name} className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                  <span>{tech.icon}</span>
                  <span className="text-sm text-white/90">{tech.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-white/5 rounded-xl p-6 border border-white/10 text-center space-y-4">
            <h4 className="text-xl font-bold text-white">Get in Touch</h4>
            <p className="text-white/80">
              Have questions, suggestions, or feedback? We'd love to hear from you!
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-white/90">
                <span className="font-medium">Email:</span> bupe@hytel.io
              </p>
              <p className="text-white/90">
                <span className="font-medium">Developer:</span> Bupe Nondo
              </p>
              <p className="text-white/90">
                <span className="font-medium">Organization:</span> Hytel
              </p>
            </div>
          </section>

          {/* Footer */}
          <section className="text-center border-t border-white/20 pt-6">
            <p className="text-xs text-white/70">
              © {new Date().getFullYear()} Hytel Organization. All rights reserved.
            </p>
            <p className="text-xs text-white/70 mt-1">
              Developed with ❤️ by Bupe Nondo
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
