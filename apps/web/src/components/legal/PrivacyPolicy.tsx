import React from 'react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
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
        <div className="flex-1 overflow-y-auto p-6 text-white/90 space-y-6">
          <div className="space-y-4">
            <section>
              <h3 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Personal Information:</strong> Name, email address, profile picture</p>
                <p><strong>Fitness Data:</strong> Workout history, goals, progress metrics, body measurements</p>
                <p><strong>Usage Data:</strong> App interactions, feature usage, session duration</p>
                <p><strong>Device Information:</strong> Device type, operating system, app version</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h3>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Provide personalized fitness recommendations</li>
                <li>• Track your progress and achievements</li>
                <li>• Improve app functionality and user experience</li>
                <li>• Send important updates and notifications</li>
                <li>• Ensure account security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">3. Data Storage and Security</h3>
              <p className="text-sm leading-relaxed">
                Your data is stored securely using Firebase, Google's cloud platform. We implement industry-standard 
                security measures including encryption, secure authentication, and regular security audits. 
                Your fitness data is encrypted both in transit and at rest.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">4. Data Sharing</h3>
              <p className="text-sm leading-relaxed mb-2">
                We do not sell, trade, or rent your personal information to third parties. We may share data only in these circumstances:
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• With your explicit consent</li>
                <li>• To comply with legal obligations</li>
                <li>• To protect our rights and safety</li>
                <li>• With service providers who assist in app operations (under strict confidentiality)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">5. Your Rights</h3>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Access your personal data</li>
                <li>• Correct inaccurate information</li>
                <li>• Delete your account and data</li>
                <li>• Export your data</li>
                <li>• Opt-out of non-essential communications</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">6. Cookies and Tracking</h3>
              <p className="text-sm leading-relaxed">
                We use essential cookies for authentication and app functionality. We do not use tracking cookies 
                for advertising purposes. You can manage cookie preferences in your browser settings.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">7. Children's Privacy</h3>
              <p className="text-sm leading-relaxed">
                FitnessApp is not intended for children under 13. We do not knowingly collect personal information 
                from children under 13. If you believe we have collected such information, please contact us immediately.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">8. International Data Transfers</h3>
              <p className="text-sm leading-relaxed">
                Your data may be processed in countries other than your own. We ensure appropriate safeguards 
                are in place to protect your data in accordance with this privacy policy.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">9. Data Retention</h3>
              <p className="text-sm leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide services. 
                You can request data deletion at any time. Some data may be retained for legal compliance.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">10. Contact Us</h3>
              <p className="text-sm leading-relaxed">
                For privacy-related questions or to exercise your rights, contact us at:
              </p>
              <div className="text-sm mt-2 space-y-1">
                <p>Email: bupe@hytel.io</p>
                <p>Developer: Bupe Nondo</p>
                <p>Organization: Hytel</p>
              </div>
            </section>

            <section className="border-t border-white/20 pt-4">
              <p className="text-xs text-white/70">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>
          </div>
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
