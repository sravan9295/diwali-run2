import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Error boundary for better error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Three.js React app error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#000',
            color: '#fff',
            fontFamily: 'monospace',
            padding: 20,
          }}
        >
          <h1 style={{ color: '#ff4444', marginBottom: 20 }}>
            Something went wrong
          </h1>
          <p style={{ marginBottom: 10 }}>
            {this.state.error?.message || 'Unknown error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#00ff88',
              color: '#000',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 5,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Initialize React app
const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)