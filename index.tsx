import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  stack: string | null;
}

// Production-grade Error Boundary to prevent white screen of death
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null, stack: null };

  // Explicitly declare React base class fields for TypeScript when React type defs are unavailable
  declare props: Readonly<ErrorBoundaryProps>;
  declare setState: (
    state:
      | Partial<ErrorBoundaryState>
      | ((prevState: Readonly<ErrorBoundaryState>, props: Readonly<ErrorBoundaryProps>) => Partial<ErrorBoundaryState> | null)
  ) => void;

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, stack: error.stack ?? null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const stackDetails = error.stack ?? errorInfo.componentStack;
    this.setState({ stack: stackDetails ?? null });

    // Emit structured telemetry-friendly logs so upstream identifiers and modules are traceable
    console.error('Uncaught application error (report to engineering with stack trace).', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#020617] text-slate-200 p-6 font-sans">
          <div className="w-full max-w-md bg-[#0F1014] border border-red-500/20 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <h1 className="text-2xl font-bold text-white mb-2">Application Error</h1>
            <p className="text-slate-400 mb-4 text-sm leading-relaxed">
              We encountered an unexpected issue. Please try refreshing the page.
            </p>
            <p className="text-slate-500 text-xs mb-6">
              If the problem persists, please share the stack trace below when reporting the error.
            </p>

            {this.state.error && (
              <div className="bg-black/50 border border-white/5 p-4 rounded-lg font-mono text-xs text-red-300 overflow-auto max-h-48 mb-4 whitespace-pre-wrap break-words">
                {this.state.error.message}
              </div>
            )}

            {this.state.stack && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-300 text-sm font-semibold">Stack trace</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(this.state.stack || '')}
                    className="text-xs text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <div className="bg-black/50 border border-white/5 p-4 rounded-lg font-mono text-[11px] text-slate-200 overflow-auto max-h-52 whitespace-pre-wrap break-words">
                  {this.state.stack}
                </div>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all active:scale-95"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    const { children } = this.props;
    return children || null;
  }
}

// Robust root finding with fallback
let rootElement = document.getElementById('root');

if (!rootElement) {
  console.warn('Root element #root not found. Creating fallback container.');
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

const root = ReactDOM.createRoot(rootElement!);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);