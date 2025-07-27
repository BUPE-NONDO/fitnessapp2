// Performance Monitoring and Optimization Utilities
// Designed to achieve 90+ Lighthouse scores

interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private resourceTimings: ResourceTiming[] = [];

  constructor() {
    this.initializeObservers();
    this.trackCoreWebVitals();
  }

  private initializeObservers() {
    // Performance Observer for navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
          }
        }
      });

      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Resource timing observer
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming;
          this.resourceTimings.push({
            name: resourceEntry.name,
            duration: resourceEntry.duration,
            size: resourceEntry.transferSize || 0,
            type: this.getResourceType(resourceEntry.name),
          });
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }
  }

  private async trackCoreWebVitals() {
    try {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

      getCLS((metric) => {
        this.metrics.cls = metric.value;
        this.reportMetric('CLS', metric.value, 0.1); // Good: < 0.1
      });

      getFID((metric) => {
        this.metrics.fid = metric.value;
        this.reportMetric('FID', metric.value, 100); // Good: < 100ms
      });

      getFCP((metric) => {
        this.metrics.fcp = metric.value;
        this.reportMetric('FCP', metric.value, 1800); // Good: < 1.8s
      });

      getLCP((metric) => {
        this.metrics.lcp = metric.value;
        this.reportMetric('LCP', metric.value, 2500); // Good: < 2.5s
      });

      getTTFB((metric) => {
        this.metrics.ttfb = metric.value;
        this.reportMetric('TTFB', metric.value, 800); // Good: < 800ms
      });
    } catch (error) {
      console.warn('Web Vitals library not available:', error);
    }
  }

  private reportMetric(name: string, value: number, threshold: number) {
    const status = value <= threshold ? 'good' : value <= threshold * 2 ? 'needs-improvement' : 'poor';
    
    console.log(`📊 ${name}: ${value.toFixed(2)}ms (${status})`);

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vital', {
        name,
        value: Math.round(value),
        status,
      });
    }

    // Send to monitoring service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.addBreadcrumb({
        category: 'performance',
        message: `${name}: ${value.toFixed(2)}ms`,
        level: status === 'poor' ? 'warning' : 'info',
        data: { metric: name, value, threshold, status },
      });
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.includes('.woff')) return 'font';
    return 'other';
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public getResourceTimings(): ResourceTiming[] {
    return [...this.resourceTimings];
  }

  public generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      resources: this.resourceTimings,
      recommendations: this.generateRecommendations(),
    };

    return JSON.stringify(report, null, 2);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.lcp && this.metrics.lcp > 2500) {
      recommendations.push('Optimize Largest Contentful Paint by reducing image sizes and improving server response times');
    }

    if (this.metrics.fid && this.metrics.fid > 100) {
      recommendations.push('Reduce First Input Delay by minimizing JavaScript execution time');
    }

    if (this.metrics.cls && this.metrics.cls > 0.1) {
      recommendations.push('Improve Cumulative Layout Shift by setting dimensions for images and ads');
    }

    const largeResources = this.resourceTimings.filter(r => r.size > 100000);
    if (largeResources.length > 0) {
      recommendations.push(`Optimize large resources: ${largeResources.map(r => r.name).join(', ')}`);
    }

    return recommendations;
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Image optimization utilities
export const optimizeImage = (src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
} = {}): string => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // If using a CDN like Cloudinary or ImageKit
  if (src.includes('cloudinary.com')) {
    let transformations = [`q_${quality}`, `f_${format}`];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    
    return src.replace('/upload/', `/upload/${transformations.join(',')}/`);
  }

  // For local images, return as-is (would need build-time optimization)
  return src;
};

// Lazy loading utilities
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Code splitting utilities
export const loadComponent = async <T>(
  importFn: () => Promise<{ default: T }>
): Promise<T> => {
  try {
    const module = await importFn();
    return module.default;
  } catch (error) {
    console.error('Failed to load component:', error);
    throw error;
  }
};

// Bundle analysis
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    import('webpack-bundle-analyzer').then(({ BundleAnalyzerPlugin }) => {
      console.log('Bundle analysis available in production build');
    }).catch(() => {
      console.log('Bundle analyzer not available');
    });
  }
};

// Memory leak detection
export const detectMemoryLeaks = () => {
  if ('performance' in window && 'memory' in (performance as any)) {
    const memory = (performance as any).memory;
    
    setInterval(() => {
      const memoryInfo = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };

      // Alert if memory usage is high
      const usagePercentage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
      
      if (usagePercentage > 80) {
        console.warn('High memory usage detected:', memoryInfo);
        
        if (typeof window !== 'undefined' && (window as any).Sentry) {
          (window as any).Sentry.addBreadcrumb({
            category: 'performance',
            message: 'High memory usage detected',
            level: 'warning',
            data: memoryInfo,
          });
        }
      }
    }, 30000); // Check every 30 seconds
  }
};

// Service Worker registration for caching
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      registration.addEventListener('updatefound', () => {
        console.log('New service worker version available');
        // Notify user about update
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = (): PerformanceMonitor => {
  const monitor = new PerformanceMonitor();
  
  // Start memory leak detection
  detectMemoryLeaks();
  
  // Register service worker
  registerServiceWorker();
  
  // Report performance metrics after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('📊 Performance Report:', monitor.generateReport());
    }, 5000);
  });

  return monitor;
};

export default PerformanceMonitor;
