import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ZoomInIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export default function DocumentViewer({ document, onClose }) {
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!document) return null;

  const fileName = document.url.split("/").pop();
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = document.url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 20, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 20, 50));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex flex-col z-50"
        onClick={onClose}
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
              {document.label}
            </p>
            <p className="text-sm text-slate-500 truncate mt-1">{fileName}</p>
          </div>

          {/* Toolbar */}
          <div
            className="flex items-center gap-2 ml-4"
            onClick={(e) => e.stopPropagation()}
          >
            {!isImage && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom out"
                >
                  <ZoomOutIcon />
                </motion.button>

                <div className="px-3 py-1 text-sm text-slate-600 bg-slate-100 rounded-lg min-w-12 text-center">
                  {zoom}%
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom in"
                >
                  <ZoomInIcon />
                </motion.button>

                <div className="w-px h-6 bg-slate-200" />
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
              title="Download"
            >
              <DownloadIcon />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-150"
              title="Close"
            >
              <CloseIcon />
            </motion.button>
          </div>
        </motion.div>

        {/* Viewer Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-6"
          onClick={onClose}
        >
          <div
            className="bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {isImage ? (
              <motion.img
                key={document.url}
                src={document.url}
                alt={document.label}
                className="max-w-full h-auto"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
                className="w-full origin-top-center transition-transform duration-150"
              >
                <object
                  data={document.url}
                  type="application/pdf"
                  className="w-full min-h-[500px]"
                  onLoad={() => setLoading(false)}
                >
                  <iframe
                    src={document.url}
                    title={document.label}
                    className="w-full h-[800px] border-0"
                    onLoad={() => setLoading(false)}
                  />
                </object>
              </motion.div>
            )}

            {loading && !isImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-slate-600"
                >
                  Chargement du document…
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
