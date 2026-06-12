// frontend/src/components/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Catches render-time errors so a single broken page never blanks the whole app
 * (previously a hooks-order violation on /beacon/:id produced a white screen
 * that survived back-navigation).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Aura render error:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-background">
          <span className="text-4xl mb-4">🌫️</span>
          <h1 className="font-serif text-2xl text-[#1C1C1A] mb-2">Something drifted off</h1>
          <p className="text-sm text-[#8A8880] max-w-sm mb-6">
            This page hit an unexpected error. You can head back home and try again.
          </p>
          <a
            href="/"
            onClick={this.handleReset}
            className="rounded-full bg-[#1C1C1A] text-white px-6 py-3 text-sm font-medium hover:bg-[#2C2C2A] transition-colors"
          >
            Back to Home
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}
