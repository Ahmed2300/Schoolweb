import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackTitle?: string;
    fallbackMessage?: string;
    onRetry?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Reusable Error Boundary component.
 * Catches JavaScript errors in child component tree and displays a fallback UI.
 */
export class ComponentErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Component Error Boundary caught an error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
        this.props.onRetry?.();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-red-50/50 border border-red-100 min-h-[200px]">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {this.props.fallbackTitle || 'حدث خطأ غير متوقع'}
                    </h3>
                    <p className="text-sm text-gray-500 text-center mb-4 max-w-xs">
                        {this.props.fallbackMessage || 'لا يمكن عرض هذا القسم. يرجى المحاولة مرة أخرى.'}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium transition-colors"
                    >
                        <RefreshCw size={14} />
                        إعادة المحاولة
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ComponentErrorBoundary;
