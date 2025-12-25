
import LiveInterviewManager from "../../components/live/LiveInterviewManager";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function LiveInterviewPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Minimal Header for Full Focus */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Link to="/company-dashboard" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Live Manager</h1>
                        <p className="text-xs text-slate-500">Mode Immersif</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-pulse flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> EN DIRECT
                    </div>
                </div>
            </div>

            {/* Main Content - Full Height */}
            <div className="flex-1 p-6 overflow-hidden">
                <LiveInterviewManager isFullScreen={true} />
            </div>
        </div>
    );
}


