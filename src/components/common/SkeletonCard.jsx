export default function SkeletonCard() {
    return (
        <div className="bg-white border border-white/60 shadow-sm rounded-2xl p-5 h-32 flex flex-col justify-between animate-pulse">
            <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="flex gap-2 pt-1">
                        <div className="h-4 w-16 bg-slate-100 rounded" />
                        <div className="h-4 w-16 bg-slate-100 rounded" />
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
                <div className="h-8 w-20 bg-slate-200 rounded-xl" />
                <div className="h-8 w-8 bg-slate-200 rounded-full" />
            </div>
        </div>
    );
}
