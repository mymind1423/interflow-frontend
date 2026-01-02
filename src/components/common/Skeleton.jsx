
export default function Skeleton({ className, count = 1 }) {
    return (
        <>
            {Array(count).fill(0).map((_, i) => (
                <div
                    key={i}
                    className={`animate-pulse bg-slate-800/50 rounded-xl ${className}`}
                />
            ))}
        </>
    );
}
