import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Text, tokens } from '@fluentui/react-components';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled portal error', error, errorInfo);
  }

  private reset = () => this.setState({ error: undefined });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div role="alert" style={{ display: 'grid', gap: '12px', justifyItems: 'start', padding: '24px' }}>
        <Text size={500} weight="semibold">
          Something went wrong.
        </Text>
        <Text style={{ color: tokens.colorNeutralForeground3 }}>{error.message}</Text>
        <Button onClick={this.reset}>Try again</Button>
      </div>
    );
  }
}
