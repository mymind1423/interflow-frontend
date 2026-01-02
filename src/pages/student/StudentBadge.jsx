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
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[128px]" />
            </div>

            <div className="max-w-md w-full perspective-1000">
                <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 hover:rotate-y-6 hover:scale-[1.02] group">
                    {/* Holographic/Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Top Section */}
                    <div className="relative p-8 pb-12 bg-gradient-to-b from-blue-600/20 to-transparent">
                        <div className="flex justify-between items-start mb-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                                Student Pass
                            </div>
                            <QrCode className="text-white/50" />
                        </div>

                        <div className="text-center">
                            <div className="w-28 h-28 mx-auto rounded-full p-1 bg-gradient-to-br from-blue-400 to-purple-500 shadow-xl shadow-blue-900/50 mb-4">
                                <div className="w-full h-full rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800">
                                    <img
                                        src={bgImage}
                                        alt={displayName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <h1 className="text-2xl font-extrabold text-white mb-1">{displayName}</h1>
                            <p className="text-blue-200/80 font-medium">{profile?.email || user?.email}</p>
                        </div>
                    </div>

                    {/* QR Section */}
                    <div className="relative px-8 pb-8 -mt-6">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-inner flex flex-col items-center gap-4 group-hover:bg-white/10 transition-colors">
                            <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl">
                                {qrDataUrl ? (
                                    <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 opacity-90" />
                                ) : (
                                    <div className="w-48 h-48 bg-white/5 flex items-center justify-center rounded-xl">
                                        <Loader2 className="animate-spin text-white/20" size={32} />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 text-center max-w-[200px] leading-relaxed">
                                Scannez ce code pour accéder au profil complet et au CV.
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 pt-0 flex gap-3">
                        <button
                            onClick={handleDownload}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <Download size={18} />
                            <span className="text-sm">Sauvegarder</span>
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-center text-slate-500 text-sm mt-8 max-w-sm">
                Gardez ce badge accessible lors de vos entretiens et forums de recrutement.
            </p>
        </div>
    );
}

