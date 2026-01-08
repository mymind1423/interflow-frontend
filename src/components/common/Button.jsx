import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Button({
    children,
    variant = 'primary', // primary, secondary, ghost, danger
    isLoading = false,
    icon: Icon,
    className = "",
    disabled,
    ...props
}) {
    const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 border border-transparent",
        secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:border-slate-300",
        ghost: "bg-transparent hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-transparent",
        danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300",
        outline: "bg-transparent border-2 border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
            ) : (
                <>
                    {Icon && <Icon size={20} />}
                    {children}
                </>
            )}
        </button>
    );
}
