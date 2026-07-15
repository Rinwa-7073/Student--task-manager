import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorPage } from '@/pages/ErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Class components remain the only way to implement a React error
 * boundary. This one sits near the root of the app (see App.tsx) so a
 * thrown render error anywhere shows a recoverable ErrorPage instead of
 * an unstyled crash screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Uncaught render error:', error, info.componentStack);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, message: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorPage message={this.state.message} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
