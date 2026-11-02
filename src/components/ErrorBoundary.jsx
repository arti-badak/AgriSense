import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { message: null }
  }

  static getDerivedStateFromError(error) {
    return { message: error.message || 'Something went wrong.' }
  }

  render() {
    if (this.state.message) {
      return (
        <div className="flex min-h-svh items-center justify-center bg-stone-50 p-6">
          <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center">
            <h1 className="text-lg font-semibold text-slate-900">AgriSense could not render</h1>
            <p className="mt-2 text-sm text-slate-600">{this.state.message}</p>
            <button
              type="button"
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
