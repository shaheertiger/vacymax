import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Production-grade Error Boundary to prevent white screen of death
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#020617] text-slate-200 p-6 font-sans">
          <div className="w-full max-w-md bg-[#0F1014] border border-red-500/20 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <h1 className="text-2xl font-bold text-white mb-2">Application Error</h1>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              We encountered an unexpected issue. Please try refreshing the page.
            </p>
            
            {this.state.error && (
                <div className="bg-black/50 border border-white/5 p-4 rounded-lg font-mono text-xs text-red-300 overflow-auto max-h-32 mb-6 whitespace-pre-wrap break-words">
                  {this.state.error.message}
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

    return this.props.children;
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