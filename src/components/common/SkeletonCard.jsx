export default function SkeletonCard() {
    return (
        <div className="glass-panel border border-white/10 shadow-sm rounded-2xl p-5 h-32 flex flex-col justify-between animate-pulse">
            <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl shrink-0" style={{ background: 'var(--skeleton-base)' }} />
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-5 rounded w-3/4" style={{ background: 'var(--skeleton-base)' }} />
                    <div className="h-4 rounded w-1/2" style={{ background: 'var(--skeleton-base)' }} />
                    <div className="flex gap-2 pt-1">
                        <div className="h-4 w-16 rounded" style={{ background: 'var(--skeleton-highlight)' }} />
                        <div className="h-4 w-16 rounded" style={{ background: 'var(--skeleton-highlight)' }} />
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
                <div className="h-8 w-20 rounded-xl" style={{ background: 'var(--skeleton-base)' }} />
                <div className="h-8 w-8 rounded-full" style={{ background: 'var(--skeleton-base)' }} />
            </div>
        </div>
    );
}
