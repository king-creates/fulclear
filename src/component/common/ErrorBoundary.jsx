import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)',
          textAlign: 'center', padding: 'var(--space-8)', background: 'var(--color-gray-50)',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--color-danger-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={32} color="var(--color-danger)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gray-900)' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--color-gray-500)', maxWidth: 420, lineHeight: 1.6 }}>
            This page ran into an unexpected error. You can try reloading, or head back to the dashboard.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{
              maxWidth: 600, overflow: 'auto', background: 'var(--color-gray-900)',
              color: '#fca5a5', padding: 'var(--space-4)', borderRadius: 'var(--radius)',
              fontSize: 'var(--text-xs)', textAlign: 'left',
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <button className="btn btn-secondary" onClick={this.handleReload}>
              <RefreshCw size={16} /> Reload Page
            </button>
            <button className="btn btn-primary" onClick={this.handleGoHome}>
              <Home size={16} /> Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;