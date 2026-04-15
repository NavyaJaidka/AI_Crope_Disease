import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, AlertTriangle, CheckCircle2, Loader2, Microscope } from 'lucide-react';
import { API_BASE } from '../config';

// ─── Severity colour map ──────────────────────────────────────────────────────
const severityStyles = {
  None:     'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/20 dark:border-green-700/50',
  Moderate: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-700/50',
  High:     'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-900/20 dark:border-orange-700/50',
  Severe:   'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-700/50',
};

// ─── Confidence Bar ───────────────────────────────────────────────────────────
const ConfidenceBar = ({ label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
  >
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-xs font-bold text-slate-800 dark:text-white">{(value * 100).toFixed(1)}%</span>
    </div>
    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value * 100}%` }}
        transition={{ duration: 0.7, delay: delay + 0.1, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color || '#22c55e' }}
      />
    </div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DiseaseDetector = () => {
  const [dragOver, setDragOver]     = useState(false);
  const [preview, setPreview]       = useState(null);
  const [file, setFile]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);

  const processFile = useCallback((f) => {
    if (!f || !f.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG).');
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = useCallback(e => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  const onInputChange = e => processFile(e.target.files[0]);

  const clearImage = () => {
    setPreview(null);
    setFile(null);
    setResult(null);
    setError(null);
  };

  const runDetection = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res  = await fetch(`${API_BASE}/api/detect`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Detection failed');
      setResult(data);
    } catch (err) {
      setError(err.message.includes('fetch') ? 'Cannot reach backend — is it running on port 5000?' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const topScores = result
    ? Object.entries(result.all_scores).sort((a, b) => b[1] - a[1]).slice(0, 5)
    : [];

  return (
    <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden" id="detector">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Microscope size={13} />
            Live Disease Detector
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Diagnose Your Crop
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Upload a leaf photograph and our AI classifier — trained on PlantVillage imagery and
            augmented with GAN-generated synthetics — will identify the disease in seconds.
          </p>
        </motion.div>

        {/* Main card */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left — upload */}
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Upload size={16} className="text-blue-500" /> Upload Leaf Image
              </h3>

              {/* Drop zone */}
              {!preview ? (
                <label
                  htmlFor="leaf-upload"
                  className={`relative flex flex-col items-center justify-center gap-4 min-h-[280px] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                    dragOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
                      : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                  }`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                >
                  <input
                    id="leaf-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={onInputChange}
                  />
                  <motion.div
                    animate={{ y: dragOver ? -6 : 0 }}
                    className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
                  >
                    <Upload size={28} className="text-blue-500" />
                  </motion.div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Drag & drop a leaf photo
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                      or <span className="text-blue-500 font-medium">click to browse</span> — JPG, PNG supported
                    </p>
                  </div>
                  <p className="text-xs text-slate-300 dark:text-slate-600">Max 10 MB</p>
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                  <img
                    src={preview}
                    alt="Leaf preview"
                    className="w-full h-[280px] object-cover"
                  />
                  <button
                    onClick={clearImage}
                    aria-label="Remove image"
                    className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm font-medium truncate">{file?.name}</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl px-4 py-3">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Analyse button */}
              <button
                onClick={runDetection}
                disabled={!file || loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.99]"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Analysing…</>
                ) : (
                  <><Microscope size={20} /> Detect Disease</>
                )}
              </button>
            </div>

            {/* Right — results */}
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" /> Diagnosis Results
              </h3>

              <AnimatePresence mode="wait">
                {!result && !loading && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-grow min-h-[280px] flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed p-8"
                  >
                    <Microscope size={40} className="mb-4 opacity-30" />
                    <p className="font-medium">Upload a leaf image to see the AI diagnosis here.</p>
                    <p className="text-sm mt-2 opacity-70">Confidence scores, treatment advice and severity rating will appear.</p>
                  </motion.div>
                )}

                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-grow min-h-[280px] flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
                  >
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900" />
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Running classifier…</p>
                    <p className="text-xs text-slate-400 dark:text-slate-600 font-mono">ResNet-18 → softmax → top-5</p>
                  </motion.div>
                )}

                {result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-4"
                  >
                    {/* Top prediction */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Prediction</p>
                          <p className="text-xl font-black text-slate-900 dark:text-white">{result.prediction}</p>
                          <p className="text-sm text-slate-400 italic">{result.cause}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
                          <p className="text-2xl font-black" style={{ color: result.color || '#22c55e' }}>
                            {(result.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${severityStyles[result.severity] || severityStyles.Moderate}`}>
                        Severity: {result.severity}
                      </span>
                      {result.is_mock && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2">
                          ℹ︎ Demo mode — train the classifier for higher accuracy
                        </p>
                      )}
                    </div>

                    {/* Confidence bars */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Top Predictions</p>
                      <div className="space-y-3">
                        {topScores.map(([name, val], i) => (
                          <ConfidenceBar
                            key={name}
                            label={name}
                            value={val}
                            color={i === 0 ? (result.color || '#22c55e') : '#94a3b8'}
                            delay={i * 0.08}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Treatment */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-2xl p-4 flex gap-3">
                      <span className="text-xl flex-shrink-0">💊</span>
                      <div>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Recommended Treatment</p>
                        <p className="text-sm text-emerald-800 dark:text-emerald-200">{result.treatment}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default DiseaseDetector;
