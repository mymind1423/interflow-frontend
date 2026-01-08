import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../../authContext';
import { QrCode, Share2, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../../api/client';

export default function StudentBadge() {
    const { user } = useAuth();
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (user) {
            // Fetch detailed profile
            apiFetch("/api/profile/get").then(setProfile).catch(console.error);

            if (user.uid) {
                const url = `${window.location.origin}/p/${user.uid}`;
                QRCode.toDataURL(url, { width: 400, margin: 1, color: { dark: '#FFFFFF', light: '#0000' } })
                    .then(setQrDataUrl)
                    .catch(console.error);
            }
        }
    }, [user]);

    const displayName = profile?.fullname || profile?.name || user?.displayName || "Étudiant";
    const bgImage = profile?.photoUrl || profile?.photo_url || user?.photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=0F172A&color=fff&size=256`;


    const handleDownload = () => {
        const link = document.createElement('a');
        link.download = `badge-${user.displayName || 'student'}.png`;
        link.href = qrDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Badge téléchargé avec succès !");
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-[128px]" />
                <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-[96px]" />
            </div>

            <div className="max-w-md w-full perspective-1000">
                <div className="relative glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 hover:rotate-y-6 hover:scale-[1.02] group ring-1 ring-slate-100 dark:ring-white/10">
                    {/* Holographic/Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Top Section */}
                    <div className="relative p-8 pb-12 bg-gradient-to-b from-indigo-50/80 to-white/0 dark:from-indigo-500/10 dark:to-transparent">
                        <div className="flex justify-between items-start mb-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                Student Pass
                            </div>
                            <QrCode className="text-slate-300 dark:text-slate-600" />
                        </div>

                        <div className="text-center">
                            <div className="w-28 h-28 mx-auto rounded-full p-1 bg-gradient-to-br from-indigo-400 to-purple-400 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 mb-4">
                                <div className="w-full h-full rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900">
                                    <img
                                        src={bgImage}
                                        alt={displayName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <h1 className="text-2xl font-extrabold text-theme-primary mb-1">{displayName}</h1>
                            <p className="text-theme-secondary font-medium">{profile?.email || user?.email}</p>
                        </div>
                    </div>

                    {/* QR Section */}
                    <div className="relative px-8 pb-8 -mt-6">
                        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-inner flex flex-col items-center gap-4 group-hover:bg-slate-100/50 dark:group-hover:bg-white/10 transition-colors">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-200/10">
                                {qrDataUrl ? (
                                    <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
                                ) : (
                                    <div className="w-48 h-48 bg-slate-50 flex items-center justify-center rounded-xl">
                                        <Loader2 className="animate-spin text-slate-300" size={32} />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-[200px] leading-relaxed">
                                Scannez ce code pour accéder au profil complet et au CV.
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 pt-0 flex gap-3">
                        <button
                            onClick={handleDownload}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 active:scale-95"
                        >
                            <Download size={18} />
                            <span className="text-sm">Sauvegarder</span>
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8 max-w-sm">
                Gardez ce badge accessible lors de vos entretiens et forums de recrutement.
            </p>
        </div>
    );
}

