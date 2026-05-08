/** @format */

// src/components/ErrorBoundary.tsx
import React from "react";

type Props = { children: React.ReactNode };
type State = {
  hasError: boolean;
  error?: Error;
  componentStack?: string;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary capturó:", error, info.componentStack);
    this.setState({ componentStack: info.componentStack ?? undefined });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: "red", whiteSpace: "pre-wrap" }}>
          <h2>Ha ocurrido un error 😵‍💫</h2>
          <h3>Mensaje:</h3>
          <pre>{this.state.error?.message}</pre>

          <h3>Stack trace (archivo:línea):</h3>
          <pre>{this.state.error?.stack}</pre>

          <h3>React component stack:</h3>
          <pre>{this.state.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
