import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { companyApi } from '../../api/companyApi';
import { aiApi } from '../../api/aiApi';
import { useAuth } from '../../authContext';
import { Star, Download, Sparkles, GraduationCap, MapPin, Phone, Mail, FileText, CheckCircle, Send, Calendar, Clock, Video } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PublicProfile() {
    const { studentId } = useParams();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [interviews, setInterviews] = useState([]); // New state for interviews
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [saving, setSaving] = useState(false);
    const [pitch, setPitch] = useState(null);
    const [pitchLoading, setPitchLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, [studentId]);

    const loadProfile = async () => {
        try {
            // Load Profile
            const data = await companyApi.getStudentProfile(studentId);
            setProfile(data);

            // Load Interviews (Public view? Or restricted? Assuming simplified public view for badge)
            // In a real app we might need a specific endpoint or permissions. 
            // For now, we reuse an endpoint or simulate it if the data comes with profile.
            // If the API doesn't support it publicly, we might skip it or Mock it.
            // Let's assume we can fetch it if we are authorized (Company or Admin or Self)
            if (user) {
                try {
                    const ints = await companyApi.getStudentInterviews(studentId); // Hypothetical endpoint
                    setInterviews(ints || []);
                } catch (e) { /* Ignore if unauthorized */ }
            }

            if (user?.role === 'company') {
                try {
                    const evalData = await companyApi.getEvaluation(studentId);
                    if (evalData) {
                        setRating(evalData.rating);
                        setComment(evalData.comment || '');
                    }
                } catch (e) {
                    // Ignore if no eval yet
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Impossible de charger le profil");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEvaluation = async () => {
        if (rating === 0) return toast.error("Veuillez sélectionner une note");
        setSaving(true);
        try {
            await companyApi.saveEvaluation({ studentId, rating, comment });
            toast.success("Évaluation enregistrée !");
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    const generatePitch = async () => {
        setPitchLoading(true);
        try {
            const jobDesc = `Entreprise ${user.displayName} (Domaine: ${user.domaine || 'Tech'}). Recherche stagiaire motivé.`;
            const res = await aiApi.generatePitch(jobDesc, studentId);
            setPitch(res.points);
        } catch (error) {
            toast.error("Erreur IA");
        } finally {
            setPitchLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-white">Chargement...</div>;
    if (!profile) return <div className="p-12 text-center text-white">Profil introuvable</div>;

    const isCompany = user?.role === 'company' || user?.user_type === 'company';

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header Profile */}
                <div className="relative h-32 bg-gradient-to-r from-blue-900 to-slate-900">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-2xl bg-slate-800 border-4 border-slate-900 overflow-hidden shadow-lg">
                            <img src={profile.photoUrl || `https://ui-avatars.com/api/?name=${profile.displayName}`} className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row gap-8">
                    {/* Main Info */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2">{profile.displayName}</h1>
                        <div className="flex flex-wrap gap-4 text-slate-400 mb-6 font-medium">
                            {profile.domaine && <span className="flex items-center gap-1"><GraduationCap size={16} className="text-blue-400" /> {profile.domaine}</span>}
                            {profile.grade && <span className="flex items-center gap-1">• {profile.grade}</span>}
                        </div>

                        <div className="space-y-2 text-sm text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                            {profile.email && <div className="flex items-center gap-2"><Mail size={14} /> {profile.email}</div>}
                            {profile.phone && <div className="flex items-center gap-2"><Phone size={14} /> {profile.phone}</div>}
                            {profile.address && <div className="flex items-center gap-2"><MapPin size={14} /> {profile.address}</div>}
                        </div>

                        <div className="mt-6 flex gap-3">
                            {profile.cvUrl && (
                                <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
                                    <FileText size={18} /> Voir le CV
                                </a>
                            )}
                            {profile.diplomaUrl && (
                                <a href={profile.diplomaUrl} target="_blank" rel="noreferrer" className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors border border-slate-700">
                                    <CheckCircle size={18} /> Diplôme
                                </a>
                            )}
                        </div>

                        {/* PLANNED INTERVIEWS SECTION (BADGE SCAN) */}
                        {interviews.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-t border-slate-800 pt-6">
                                    <Calendar className="text-emerald-500" /> Entretiens Programmés
                                </h3>
                                <div className="space-y-3">
                                    {interviews.map(int => (
                                        <div key={int.id} className="bg-slate-800/40 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-white text-sm">{int.companyName}</p>
                                                <p className="text-xs text-slate-400">{int.title}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                                    <Clock size={12} /> {new Date(int.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">{int.room ? `Salle ${int.room}` : 'En ligne'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI & Scorecard Column */}
                    {isCompany && (
                        <div className="w-full md:w-80 space-y-6">
                            {/* Scorecard */}
                            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <Star size={18} className="text-yellow-400 fill-yellow-400" /> Scorecard Express
                                </h3>
                                <div className="flex justify-center gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transform hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                size={32}
                                                className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} transition-colors`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm mb-3 focus:border-blue-500 outline-none resize-none"
                                    rows="3"
                                    placeholder="Note rapide sur le candidat..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                />
                                <button
                                    onClick={handleSaveEvaluation}
                                    disabled={saving}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-bold text-sm transition-colors flex justify-center items-center"
                                >
                                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>

                            {/* AI PITCH */}
                            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-5 rounded-2xl border border-indigo-700/50 shadow-xl">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <Sparkles size={18} className="text-purple-300" /> Assistant IA
                                </h3>
                                {!pitch ? (
                                    <div className="text-center">
                                        <p className="text-indigo-200 text-xs mb-3">Générez 3 points clés pour guider l'entretien avec ce profil.</p>
                                        <button
                                            onClick={generatePitch}
                                            disabled={pitchLoading}
                                            className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl font-bold text-sm transition-colors border border-white/10"
                                        >
                                            {pitchLoading ? 'Analyse en cours...' : 'Générer Pitch'}
                                        </button>
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {pitch.map((p, i) => (
                                            <li key={i} className="text-xs text-indigo-100 bg-indigo-950/50 p-2 rounded border border-indigo-800 flex gap-2">
                                                <span className="text-purple-400 font-bold">•</span> {p}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

