import { useState } from 'react';
import { X, FileText, CheckCircle, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';

export default function ApplyModal({ isOpen, onClose, onConfirm, jobTitle, isApplying }) {
    const [selectedCv, setSelectedCv] = useState('cv1');

    // Mock CVs - In real app, fetch from profile
    const cvs = [
        { id: 'cv1', name: 'CV_Developpeur_Fullstack_2024.pdf', date: 'Ajouté le 12 Jan' },
        { id: 'cv2', name: 'CV_Generaliste_Alternance.pdf', date: 'Ajouté le 05 Dec' },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Postuler à l'offre</h3>
                            <p className="text-sm text-gray-500 font-medium">{jobTitle}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Sélectionnez un CV</h4>

                        <div className="space-y-3 mb-6">
                            {cvs.map(cv => (
                                <div
                                    key={cv.id}
                                    onClick={() => setSelectedCv(cv.id)}
                                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedCv === cv.id
                                        ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                                        : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedCv === cv.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        <FileText size={20} />
                                    </div>

                                    <div className="flex-1">
                                        <p className={`font-bold text-sm ${selectedCv === cv.id ? 'text-blue-900' : 'text-gray-700'}`}>
                                            {cv.name}
                                        </p>
                                        <p className="text-xs text-gray-400">{cv.date}</p>
                                    </div>

                                    {selectedCv === cv.id && (
                                        <div className="text-blue-600">
                                            <CheckCircle size={20} className="fill-blue-600 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/10 cursor-pointer transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 group">
                                <Upload size={18} className="group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-sm">Importer un nouveau CV</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isApplying}>
                                Annuler
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => onConfirm(selectedCv)}
                                isLoading={isApplying}
                                className="flex-[2]"
                            >
                                Envoyer ma candidature
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
