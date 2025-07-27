import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface LegalConsent {
  userId: string;
  termsAccepted: boolean;
  termsAcceptedAt?: Date;
  termsVersion?: string;
  privacyPolicyAccepted: boolean;
  privacyPolicyAcceptedAt?: Date;
  privacyPolicyVersion?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentUpdate {
  termsAccepted?: boolean;
  privacyPolicyAccepted?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export class LegalComplianceService {
  private static readonly COLLECTION = 'legalConsents';
  private static readonly CURRENT_TERMS_VERSION = '1.0.0';
  private static readonly CURRENT_PRIVACY_VERSION = '1.0.0';

  /**
   * Record user's acceptance of terms and conditions
   */
  static async recordTermsAcceptance(userId: string, additionalData?: Partial<ConsentUpdate>): Promise<void> {
    try {
      const consentRef = doc(db, this.COLLECTION, userId);
      const existingConsent = await getDoc(consentRef);

      const updateData = {
        termsAccepted: true,
        termsAcceptedAt: serverTimestamp(),
        termsVersion: this.CURRENT_TERMS_VERSION,
        updatedAt: serverTimestamp(),
        ...additionalData
      };

      if (existingConsent.exists()) {
        await updateDoc(consentRef, updateData);
      } else {
        await setDoc(consentRef, {
          userId,
          termsAccepted: true,
          termsAcceptedAt: serverTimestamp(),
          termsVersion: this.CURRENT_TERMS_VERSION,
          privacyPolicyAccepted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...additionalData
        });
      }

      console.log('✅ Terms acceptance recorded for user:', userId);
    } catch (error) {
      console.error('❌ Error recording terms acceptance:', error);
      throw new Error('Failed to record terms acceptance');
    }
  }

  /**
   * Record user's acceptance of privacy policy
   */
  static async recordPrivacyAcceptance(userId: string, additionalData?: Partial<ConsentUpdate>): Promise<void> {
    try {
      const consentRef = doc(db, this.COLLECTION, userId);
      const existingConsent = await getDoc(consentRef);

      const updateData = {
        privacyPolicyAccepted: true,
        privacyPolicyAcceptedAt: serverTimestamp(),
        privacyPolicyVersion: this.CURRENT_PRIVACY_VERSION,
        updatedAt: serverTimestamp(),
        ...additionalData
      };

      if (existingConsent.exists()) {
        await updateDoc(consentRef, updateData);
      } else {
        await setDoc(consentRef, {
          userId,
          termsAccepted: false,
          privacyPolicyAccepted: true,
          privacyPolicyAcceptedAt: serverTimestamp(),
          privacyPolicyVersion: this.CURRENT_PRIVACY_VERSION,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...additionalData
        });
      }

      console.log('✅ Privacy policy acceptance recorded for user:', userId);
    } catch (error) {
      console.error('❌ Error recording privacy acceptance:', error);
      throw new Error('Failed to record privacy policy acceptance');
    }
  }

  /**
   * Record both terms and privacy acceptance (for signup)
   */
  static async recordFullConsent(userId: string, additionalData?: Partial<ConsentUpdate>): Promise<void> {
    try {
      const consentRef = doc(db, this.COLLECTION, userId);
      
      await setDoc(consentRef, {
        userId,
        termsAccepted: true,
        termsAcceptedAt: serverTimestamp(),
        termsVersion: this.CURRENT_TERMS_VERSION,
        privacyPolicyAccepted: true,
        privacyPolicyAcceptedAt: serverTimestamp(),
        privacyPolicyVersion: this.CURRENT_PRIVACY_VERSION,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...additionalData
      });

      console.log('✅ Full legal consent recorded for user:', userId);
    } catch (error) {
      console.error('❌ Error recording full consent:', error);
      throw new Error('Failed to record legal consent');
    }
  }

  /**
   * Get user's current consent status
   */
  static async getUserConsent(userId: string): Promise<LegalConsent | null> {
    try {
      const consentRef = doc(db, this.COLLECTION, userId);
      const consentDoc = await getDoc(consentRef);

      if (!consentDoc.exists()) {
        return null;
      }

      const data = consentDoc.data();
      return {
        userId: data.userId,
        termsAccepted: data.termsAccepted || false,
        termsAcceptedAt: data.termsAcceptedAt?.toDate(),
        termsVersion: data.termsVersion,
        privacyPolicyAccepted: data.privacyPolicyAccepted || false,
        privacyPolicyAcceptedAt: data.privacyPolicyAcceptedAt?.toDate(),
        privacyPolicyVersion: data.privacyPolicyVersion,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    } catch (error) {
      console.error('❌ Error getting user consent:', error);
      throw new Error('Failed to get user consent status');
    }
  }

  /**
   * Check if user needs to accept updated terms
   */
  static async needsTermsUpdate(userId: string): Promise<boolean> {
    try {
      const consent = await this.getUserConsent(userId);
      
      if (!consent || !consent.termsAccepted) {
        return true;
      }

      // Check if terms version is outdated
      return consent.termsVersion !== this.CURRENT_TERMS_VERSION;
    } catch (error) {
      console.error('❌ Error checking terms update requirement:', error);
      return true; // Err on the side of caution
    }
  }

  /**
   * Check if user needs to accept updated privacy policy
   */
  static async needsPrivacyUpdate(userId: string): Promise<boolean> {
    try {
      const consent = await this.getUserConsent(userId);
      
      if (!consent || !consent.privacyPolicyAccepted) {
        return true;
      }

      // Check if privacy policy version is outdated
      return consent.privacyPolicyVersion !== this.CURRENT_PRIVACY_VERSION;
    } catch (error) {
      console.error('❌ Error checking privacy update requirement:', error);
      return true; // Err on the side of caution
    }
  }

  /**
   * Get user's IP address and user agent for compliance tracking
   */
  static async getComplianceMetadata(): Promise<Partial<ConsentUpdate>> {
    try {
      // Get user agent
      const userAgent = navigator.userAgent;

      // Try to get IP address (this would typically be done server-side)
      let ipAddress: string | undefined;
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipAddress = data.ip;
      } catch (ipError) {
        console.warn('Could not fetch IP address for compliance tracking');
      }

      return {
        userAgent,
        ipAddress
      };
    } catch (error) {
      console.error('Error getting compliance metadata:', error);
      return {};
    }
  }

  /**
   * Withdraw consent (for GDPR compliance)
   */
  static async withdrawConsent(userId: string): Promise<void> {
    try {
      const consentRef = doc(db, this.COLLECTION, userId);
      
      await updateDoc(consentRef, {
        termsAccepted: false,
        privacyPolicyAccepted: false,
        consentWithdrawnAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Consent withdrawn for user:', userId);
    } catch (error) {
      console.error('❌ Error withdrawing consent:', error);
      throw new Error('Failed to withdraw consent');
    }
  }
}
