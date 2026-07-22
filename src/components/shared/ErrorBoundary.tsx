import React from 'react';

interface Props { children: React.ReactNode; fallback?: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '20px', margin: '20px', background: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
          <p style={{ color: '#dc2626', fontWeight: 'bold' }}>组件渲染错误</p>
          <p style={{ color: '#7f1d1d', fontSize: '14px' }}>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
