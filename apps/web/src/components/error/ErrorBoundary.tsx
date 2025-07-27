import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/design-system/DesignSystem';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to monitoring service
    this.logError(error, errorInfo);
    
    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component',
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }

    // Send to error monitoring service (e.g., Sentry, LogRocket)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          errorBoundary: true,
          level: this.props.level,
        },
        extra: errorData,
      });
    }

    // Send to custom analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: this.props.level === 'critical',
        error_id: this.state.errorId,
      });
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReport = () => {
    const subject = encodeURIComponent(`Error Report - ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error Message: ${this.state.error?.message}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
[Your description here]
    `);
    
    window.open(`mailto:support@fitnessapp.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Different error UIs based on level
      if (this.props.level === 'critical') {
        return (
          <div className="min-h-screen bg-error-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-6xl mb-4">💥</div>
              <h1 className="text-2xl font-bold text-error-600 mb-2">
                Critical Error
              </h1>
              <p className="text-secondary-600 mb-6">
                Something went seriously wrong. Please reload the page or contact support.
              </p>
              <div className="space-y-3">
                <Button
                  variant="error"
                  size="lg"
                  onClick={this.handleReload}
                  className="w-full"
                >
                  Reload Page
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={this.handleReport}
                  className="w-full"
                >
                  Report Issue
                </Button>
              </div>
              <p className="text-xs text-secondary-400 mt-4">
                Error ID: {this.state.errorId}
              </p>
            </div>
          </div>
        );
      }

      if (this.props.level === 'page') {
        return (
          <div className="min-h-96 bg-warning-50 rounded-xl border border-warning-200 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-warning-700 mb-2">
                Page Error
              </h2>
              <p className="text-secondary-600 mb-4">
                This page encountered an error. You can try again or go back.
              </p>
              <div className="flex space-x-3 justify-center">
                <Button
                  variant="warning"
                  onClick={this.handleRetry}
                >
                  Try Again
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-secondary-500">
                    Error Details (Dev Mode)
                  </summary>
                  <pre className="text-xs bg-secondary-100 p-2 rounded mt-2 overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        );
      }

      // Component level error (default)
      return (
        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🔧</div>
          <h3 className="font-medium text-secondary-700 mb-1">
            Component Error
          </h3>
          <p className="text-sm text-secondary-500 mb-3">
            This component failed to load properly.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={this.handleRetry}
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Async error boundary for handling promise rejections
export const AsyncErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Log to monitoring service
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(event.reason, {
          tags: {
            unhandledRejection: true,
          },
        });
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
};

// HOC for wrapping components with error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Error boundary hook for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
    
    // Log error
    console.error('Error captured by useErrorHandler:', error);
    
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

export default ErrorBoundary;
