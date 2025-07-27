// Analytics & Product Management System
// Privacy-first analytics with data-driven decision making

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
}

interface UserProperties {
  userId: string;
  email?: string;
  fitnessLevel?: string;
  goals?: string[];
  signupDate?: Date;
  lastActiveDate?: Date;
  totalWorkouts?: number;
  subscriptionTier?: string;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

class AnalyticsManager {
  private userId: string | null = null;
  private sessionId: string;
  private isEnabled: boolean = true;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private maxQueueSize: number = 50;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeAnalytics();
    this.startPerformanceMonitoring();
    this.setupEventFlush();
  }

  private initializeAnalytics(): void {
    // Check user consent for analytics
    const consent = localStorage.getItem('analytics-consent');
    this.isEnabled = consent === 'true';

    // Initialize Google Analytics 4
    if (this.isEnabled && typeof window !== 'undefined') {
      this.loadGoogleAnalytics();
      this.loadPostHog();
    }

    // Track page views
    this.trackPageView();
  }

  private loadGoogleAnalytics(): void {
    const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
    if (!GA_MEASUREMENT_ID) return;

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function() {
      (window as any).dataLayer.push(arguments);
    };

    (window as any).gtag('js', new Date());
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false, // We'll handle this manually
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  }

  private loadPostHog(): void {
    const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY;
    if (!POSTHOG_KEY) return;

    // PostHog for product analytics
    import('posthog-js').then((posthog) => {
      posthog.default.init(POSTHOG_KEY, {
        api_host: 'https://app.posthog.com',
        autocapture: false, // We'll track events manually
        capture_pageview: false,
        disable_session_recording: true, // Privacy-first
        respect_dnt: true,
        opt_out_capturing_by_default: !this.isEnabled,
      });
    });
  }

  public setUserId(userId: string): void {
    this.userId = userId;
    
    if (this.isEnabled && typeof window !== 'undefined') {
      // Set user ID in Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
          user_id: userId,
        });
      }

      // Set user ID in PostHog
      import('posthog-js').then((posthog) => {
        posthog.default.identify(userId);
      });
    }
  }

  public updateUserProperties(properties: Partial<UserProperties>): void {
    if (!this.isEnabled) return;

    // Update user properties in analytics platforms
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'user_properties_update', properties);
    }

    import('posthog-js').then((posthog) => {
      posthog.default.people.set(properties);
    });
  }

  public track(eventName: string, properties: Record<string, any> = {}): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
      },
      userId: this.userId || undefined,
      timestamp: new Date(),
    };

    // Add to queue
    this.eventQueue.push(event);

    // Flush if queue is full
    if (this.eventQueue.length >= this.maxQueueSize) {
      this.flushEvents();
    }

    // Send to analytics platforms immediately for critical events
    if (this.isCriticalEvent(eventName)) {
      this.sendToAnalyticsPlatforms(event);
    }
  }

  public trackPageView(page?: string): void {
    const currentPage = page || window.location.pathname;
    
    this.track('page_view', {
      page: currentPage,
      title: document.title,
      search: window.location.search,
      hash: window.location.hash,
    });
  }

  public trackWorkoutEvent(eventType: string, workoutData: any): void {
    this.track(`workout_${eventType}`, {
      workoutId: workoutData.id,
      workoutType: workoutData.type,
      duration: workoutData.duration,
      exerciseCount: workoutData.exercises?.length,
      difficulty: workoutData.difficulty,
      completionRate: workoutData.completionRate,
    });
  }

  public trackUserEngagement(action: string, element: string, value?: number): void {
    this.track('user_engagement', {
      action,
      element,
      value,
      timestamp: Date.now(),
    });
  }

  public trackError(error: Error, context?: string): void {
    this.track('error_occurred', {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  }

  public trackPerformance(metrics: PerformanceMetrics): void {
    this.track('performance_metrics', {
      ...metrics,
      connectionType: (navigator as any).connection?.effectiveType,
      deviceMemory: (navigator as any).deviceMemory,
    });
  }

  public trackConversion(conversionType: string, value?: number): void {
    this.track('conversion', {
      conversionType,
      value,
      timestamp: Date.now(),
    });

    // Send to Google Analytics as conversion event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        send_to: process.env.REACT_APP_GA_MEASUREMENT_ID,
        value: value,
        currency: 'USD',
        transaction_id: this.generateTransactionId(),
      });
    }
  }

  public trackABTest(testName: string, variant: string): void {
    this.track('ab_test_exposure', {
      testName,
      variant,
      timestamp: Date.now(),
    });

    // Store variant for consistent experience
    localStorage.setItem(`ab_test_${testName}`, variant);
  }

  public getABTestVariant(testName: string): string | null {
    return localStorage.getItem(`ab_test_${testName}`);
  }

  public enableAnalytics(): void {
    this.isEnabled = true;
    localStorage.setItem('analytics-consent', 'true');
    
    // Re-initialize analytics platforms
    this.loadGoogleAnalytics();
    this.loadPostHog();
    
    this.track('analytics_enabled');
  }

  public disableAnalytics(): void {
    this.isEnabled = false;
    localStorage.setItem('analytics-consent', 'false');
    
    // Opt out of analytics platforms
    if (typeof window !== 'undefined') {
      import('posthog-js').then((posthog) => {
        posthog.default.opt_out_capturing();
      });
    }
    
    this.track('analytics_disabled');
    this.flushEvents(); // Send final events
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isCriticalEvent(eventName: string): boolean {
    const criticalEvents = [
      'user_signup',
      'user_login',
      'workout_completed',
      'subscription_purchased',
      'error_occurred',
    ];
    return criticalEvents.includes(eventName);
  }

  private sendToAnalyticsPlatforms(event: AnalyticsEvent): void {
    // Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.name, event.properties);
    }

    // Send to PostHog
    import('posthog-js').then((posthog) => {
      posthog.default.capture(event.name, event.properties);
    });
  }

  private flushEvents(): void {
    if (this.eventQueue.length === 0) return;

    // Send events to analytics platforms
    this.eventQueue.forEach(event => {
      this.sendToAnalyticsPlatforms(event);
    });

    // Send to custom analytics endpoint
    this.sendToCustomEndpoint(this.eventQueue);

    // Clear queue
    this.eventQueue = [];
  }

  private async sendToCustomEndpoint(events: AnalyticsEvent[]): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
    }
  }

  private setupEventFlush(): void {
    // Flush events periodically
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);

    // Flush events before page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });

    // Flush events when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushEvents();
      }
    });
  }

  private startPerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => this.trackPerformance({ ...metric } as any));
        getFID((metric) => this.trackPerformance({ ...metric } as any));
        getFCP((metric) => this.trackPerformance({ ...metric } as any));
        getLCP((metric) => this.trackPerformance({ ...metric } as any));
        getTTFB((metric) => this.trackPerformance({ ...metric } as any));
      });
    }

    // Monitor custom performance metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.trackPerformance({
          pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
          timeToInteractive: navigation.domInteractive - navigation.fetchStart,
          firstContentfulPaint: 0, // Will be set by web-vitals
          largestContentfulPaint: 0, // Will be set by web-vitals
          cumulativeLayoutShift: 0, // Will be set by web-vitals
          firstInputDelay: 0, // Will be set by web-vitals
        });
      }, 0);
    });
  }
}

// Create singleton instance
export const analytics = new AnalyticsManager();

// Convenience functions
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analytics.track(name, properties);
};

export const trackPageView = (page?: string) => {
  analytics.trackPageView(page);
};

export const trackWorkout = (eventType: string, workoutData: any) => {
  analytics.trackWorkoutEvent(eventType, workoutData);
};

export const trackError = (error: Error, context?: string) => {
  analytics.trackError(error, context);
};

export const setUserId = (userId: string) => {
  analytics.setUserId(userId);
};

export const updateUserProperties = (properties: Partial<UserProperties>) => {
  analytics.updateUserProperties(properties);
};

export default analytics;
