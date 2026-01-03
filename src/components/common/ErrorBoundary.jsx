import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-500/20">
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">Oups ! Une erreur est survenue.</h1>
                        <p className="text-slate-400 mb-6">
                            Quelque chose s'est mal passé. Nous en avons été notifiés.
                            Essayez de rafraîchir la page.
                        </p>

                        {this.state.error && (
                            <div className="mb-6 p-3 bg-red-950/30 rounded-lg text-left overflow-hidden">
                                <code className="text-xs text-red-400 font-mono block break-words">
                                    {this.state.error.toString()}
                                </code>
                            </div>
                        )}

                        <button
                            onClick={this.handleReload}
                            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={20} />
                            Rafraîchir la page
                        </button>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-4 text-sm text-slate-500 hover:text-white transition-colors"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
