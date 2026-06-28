import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ color: '#ff4757', marginBottom: '12px' }}>Something went wrong</h2>
          <pre style={{ color: '#666', fontSize: '0.85rem', whiteSpace: 'pre-wrap', maxWidth: '600px', margin: '0 auto' }}>
            {this.state.error.message}
          </pre>
          <button onClick={() => { this.setState({ error: null }); window.location.href = '/auth'; }}
            style={{ marginTop: '20px', padding: '12px 32px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
            Go to Sign In
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
