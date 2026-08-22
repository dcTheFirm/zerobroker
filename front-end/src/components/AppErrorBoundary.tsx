import { Component, type ErrorInfo, type ReactNode } from 'react'

interface AppErrorBoundaryProps { children: ReactNode }
interface AppErrorBoundaryState { hasError: boolean }

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ZeroBroker render error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return <main className="app-error"><span className="eyebrow">ZeroBroker</span><h1>We hit a loading issue.</h1><p>Please refresh once. If it continues, rebuild the frontend with its VITE service URLs configured.</p><button className="btn btn--primary" onClick={() => window.location.reload()}>Reload page</button></main>
    }
    return this.props.children
  }
}
