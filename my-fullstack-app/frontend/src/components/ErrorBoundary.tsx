import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>⚠️ Application Error</h1>
                    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Error Details:</h2>
                        <pre style={{
                            background: '#fff',
                            padding: '15px',
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontSize: '14px',
                            border: '1px solid #dee2e6'
                        }}>
                            {this.state.error?.toString()}
                        </pre>
                    </div>
                    {this.state.errorInfo && (
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                            <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Component Stack:</h2>
                            <pre style={{
                                background: '#fff',
                                padding: '15px',
                                borderRadius: '4px',
                                overflow: 'auto',
                                fontSize: '12px',
                                border: '1px solid #dee2e6'
                            }}>
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </div>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
