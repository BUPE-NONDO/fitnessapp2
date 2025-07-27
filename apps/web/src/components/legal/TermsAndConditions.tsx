import React, { useState } from 'react';

interface TermsAndConditionsProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export function TermsAndConditions({ 
  isOpen, 
  onClose, 
  onAccept, 
  showAcceptButton = false 
}: TermsAndConditionsProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setHasScrolledToBottom(isAtBottom);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">Terms and Conditions</h2>
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
        <div 
          className="flex-1 overflow-y-auto p-6 text-white/90 space-y-6"
          onScroll={handleScroll}
        >
          <div className="space-y-4">
            <section>
              <h3 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h3>
              <p className="text-sm leading-relaxed">
                By accessing and using FitnessApp ("the App"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">2. Use License</h3>
              <p className="text-sm leading-relaxed mb-2">
                Permission is granted to temporarily download one copy of FitnessApp for personal, non-commercial transitory viewing only. 
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• modify or copy the materials</li>
                <li>• use the materials for any commercial purpose or for any public display</li>
                <li>• attempt to reverse engineer any software contained in the App</li>
                <li>• remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">3. Health and Safety Disclaimer</h3>
              <p className="text-sm leading-relaxed">
                FitnessApp provides fitness and wellness information for educational purposes only. Before beginning any exercise program, 
                consult with your physician. The App is not intended to diagnose, treat, cure, or prevent any disease. 
                You assume full responsibility for your health and safety when using this App.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">4. User Data and Privacy</h3>
              <p className="text-sm leading-relaxed">
                We collect and process your personal data in accordance with our Privacy Policy. By using the App, 
                you consent to the collection and use of your information as outlined in our Privacy Policy. 
                We implement appropriate security measures to protect your personal information.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">5. User Responsibilities</h3>
              <p className="text-sm leading-relaxed mb-2">As a user of FitnessApp, you agree to:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Provide accurate and truthful information</li>
                <li>• Maintain the security of your account credentials</li>
                <li>• Use the App in compliance with all applicable laws</li>
                <li>• Not share your account with others</li>
                <li>• Report any security vulnerabilities or bugs</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">6. Limitation of Liability</h3>
              <p className="text-sm leading-relaxed">
                In no event shall Hytel or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                to use FitnessApp, even if Hytel or a Hytel authorized representative has been notified orally or in writing 
                of the possibility of such damage.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">7. Service Availability</h3>
              <p className="text-sm leading-relaxed">
                We strive to maintain high availability of our services but cannot guarantee uninterrupted access. 
                We reserve the right to modify, suspend, or discontinue any part of the service with or without notice.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">8. Intellectual Property</h3>
              <p className="text-sm leading-relaxed">
                All content, features, and functionality of FitnessApp are owned by Hytel and are protected by 
                international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">9. Modifications to Terms</h3>
              <p className="text-sm leading-relaxed">
                Hytel may revise these terms of service at any time without notice. By using this App, 
                you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">10. Contact Information</h3>
              <p className="text-sm leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at:
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
        <div className="p-6 border-t border-white/20 flex justify-between items-center">
          <div className="text-xs text-white/70">
            {showAcceptButton && !hasScrolledToBottom && (
              <span>Please scroll to the bottom to accept terms</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              Close
            </button>
            {showAcceptButton && (
              <button
                onClick={onAccept}
                disabled={!hasScrolledToBottom}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Accept Terms
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
