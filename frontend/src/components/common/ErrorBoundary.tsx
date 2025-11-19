import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-lg">
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center">
              <h2 className="text-2xl font-bold">An Error Occurred</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-300">Something went wrong. Please try again.</p>
              <details className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <summary className="text-red-400 cursor-pointer">Error Details</summary>
                <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </pre>
              </details>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
