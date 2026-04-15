import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { API_BASE } from '../config';

// ─── Pure-SVG Line Chart (no extra dependencies needed) ───────────────────────
const LossChart = ({ epochs, gLosses, dLosses, fidScores }) => {
  const W = 700, H = 280;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  const allVals  = [...(gLosses || []), ...(dLosses || [])];
  const maxY     = Math.max(...allVals, 0.1) * 1.08;
  const minY     = 0;
  const n        = (gLosses || []).length;

  const xS = (i) => (n <= 1 ? cW / 2 : (i / (n - 1)) * cW);
  const yS = (v) => cH - ((v - minY) / (maxY - minY)) * cH;

  const pathD = (data) =>
    data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xS(i).toFixed(1)} ${yS(v).toFixed(1)}`).join(' ');

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    y: t * cH,
    val: ((maxY * (1 - t)) + minY * t).toFixed(2),
  }));

  const xTicks = [0, 10, 20, 30, 40, 49].filter(i => i < n);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible text-slate-400 dark:text-slate-600">
      {/* Grid */}
      {gridLines.map(({ y, val }) => (
        <g key={y} transform={`translate(${pad.left}, ${pad.top})`}>
          <line x1={0} y1={y} x2={cW} y2={y} stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} strokeDasharray="4 4" />
          <text x={-8} y={y + 4} textAnchor="end" fontSize={10} fill="currentColor">{val}</text>
        </g>
      ))}
      {/* X-axis ticks */}
      {xTicks.map(i => (
        <text key={i} x={pad.left + xS(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="currentColor">
          {i + 1}
        </text>
      ))}
      {/* Axis labels */}
      <text x={pad.left + cW / 2} y={H} textAnchor="middle" fontSize={11} fill="currentColor" className="font-medium">Epoch</text>
      <text x={12} y={pad.top + cH / 2} textAnchor="middle" fontSize={11} fill="currentColor" transform={`rotate(-90, 12, ${pad.top + cH / 2})`}>Loss</text>

      {/* Lines */}
      <g transform={`translate(${pad.left}, ${pad.top})`}>
        {/* G Loss */}
        <path d={pathD(gLosses || [])} fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* D Loss */}
        <path d={pathD(dLosses || [])} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* Area under G Loss */}
        <path
          d={`${pathD(gLosses || [])} L ${xS(n - 1)} ${cH} L 0 ${cH} Z`}
          fill="#10b981" fillOpacity={0.06}
        />
      </g>

      {/* Legend */}
      <g transform={`translate(${pad.left + cW - 180}, ${pad.top + 4})`}>
        <rect width={180} height={42} rx={8} fill="white" fillOpacity={0.05} />
        <circle cx={14} cy={14} r={5} fill="#10b981" />
        <text x={24} y={18} fontSize={11} fill="#10b981" fontWeight="600">Generator Loss</text>
        <circle cx={14} cy={30} r={5} fill="#6366f1" />
        <text x={24} y={34} fontSize={11} fill="#6366f1" fontWeight="600">Discriminator Loss</text>
      </g>
    </svg>
  );
};

// ─── FID Chart ────────────────────────────────────────────────────────────────
const FidChart = ({ epochs, fidScores }) => {
  const W = 700, H = 160;
  const pad = { top: 16, right: 20, bottom: 36, left: 60 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const n = (fidScores || []).length;
  if (!n) return null;

  const maxY = Math.max(...fidScores) * 1.05;
  const xS = i => (n <= 1 ? cW / 2 : (i / (n - 1)) * cW);
  const yS = v  => cH - (v / maxY) * cH;
  const pathD = fidScores.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xS(i).toFixed(1)} ${yS(v).toFixed(1)}`).join(' ');

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible text-slate-400 dark:text-slate-600 mt-2">
      <g transform={`translate(${pad.left}, ${pad.top})`}>
        <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`${pathD} L ${xS(n-1)} ${cH} L 0 ${cH} Z`} fill="#f59e0b" fillOpacity={0.08} />
        {[0, 0.5, 1].map(t => {
          const y = t * cH;
          const val = (maxY * (1 - t)).toFixed(0);
          return <g key={t}>
            <line x1={0} y1={y} x2={cW} y2={y} stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} strokeDasharray="4 4" />
            <text x={-8} y={y + 4} textAnchor="end" fontSize={10} fill="currentColor">{val}</text>
          </g>;
        })}
        <text x={cW / 2} y={cH + 28} textAnchor="middle" fontSize={10} fill="currentColor">Epoch</text>
        <text x={-44} y={cH / 2 + 4} textAnchor="middle" fontSize={10} fill="currentColor" transform={`rotate(-90, -44, ${cH / 2})`}>FID Score ↓</text>
      </g>
      <text x={pad.left + 8} y={pad.top + 14} fontSize={11} fill="#f59e0b" fontWeight="600">FID Score (lower = better)</text>
    </svg>
  );
};

// ─── Main Dashboard Component ─────────────────────────────────────────────────
import { Play, Download, Image as ImageIcon, Activity } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab]       = useState('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [numImages, setNumImages]       = useState(4);
  const [seed, setSeed]                 = useState('');
  const [genError, setGenError]         = useState('');
  const [modelTrained, setModelTrained] = useState(null);
  const [metrics, setMetrics]           = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsReal, setMetricsReal]   = useState(false);

  // ── Check backend health on mount ──────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(r => r.json())
      .then(d => setModelTrained(d.model_trained))
      .catch(() => setModelTrained(false));
  }, []);

  // ── Fetch metrics when Metrics tab is opened ────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'metrics' || metrics) return;
    setMetricsLoading(true);
    fetch(`${API_BASE}/api/training-metrics`)
      .then(r => r.json())
      .then(d => { setMetrics(d); setMetricsReal(d.is_real); })
      .catch(() => setMetrics(null))
      .finally(() => setMetricsLoading(false));
  }, [activeTab, metrics]);

  // ── Generate images ─────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenError('');
    setGeneratedImages([]);
    try {
      const body = { num_images: numImages };
      if (seed.trim()) body.seed = parseInt(seed.trim(), 10);
      const res  = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Generation failed');
      setGeneratedImages(data.images);
      setModelTrained(data.model_trained);
    } catch (err) {
      setGenError(err.message.includes('fetch')
        ? 'Cannot reach backend — start it with: python backend/app.py'
        : err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="py-20 bg-white dark:bg-slate-950 relative" id="demo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Interactive Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Interact with the trained DCGAN model directly via the Flask API.
            </p>
          </div>

          {/* Backend status badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            modelTrained === null
              ? 'border-slate-300 text-slate-400'
              : modelTrained
                ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300'
                : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${modelTrained ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            {modelTrained === null ? 'Checking backend…' : modelTrained ? 'Trained model loaded' : 'Random weights (train first)'}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-max">
            {['generate', 'metrics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'generate' ? 'Generate' : 'Training Metrics'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab panels */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl lg:rounded-[2rem] border border-slate-200 dark:border-slate-800 p-4 md:p-8 shadow-xl">

          {/* ── Generate Tab ──────────────────────────────────────────────────── */}
          {activeTab === 'generate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Controls */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <ImageIcon size={18} className="text-green-500" /> Generation Settings
                </h3>

                <div className="space-y-6 flex-grow">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Crop</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all">
                      <option>Tomato</option>
                      <option disabled>Potato (Coming Soon)</option>
                      <option disabled>Apple (Coming Soon)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Batch Size: <span className="text-green-600 dark:text-green-400 font-bold">{numImages}</span>
                    </label>
                    <input
                      type="range" min="1" max="16" value={numImages}
                      onChange={e => setNumImages(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>1</span><span>16</span></div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Noise Seed <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="number"
                      value={seed}
                      onChange={e => setSeed(e.target.value)}
                      placeholder="e.g. 42  (blank = random)"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none font-mono text-sm transition-all"
                    />
                  </div>
                </div>

                {genError && (
                  <div className="mt-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-700/50">
                    ⚠ {genError}
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  id="generate-btn"
                  className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.99]"
                >
                  {isGenerating ? (
                    <><Activity size={20} className="animate-spin" /> Generating…</>
                  ) : (
                    <><Play size={20} fill="currentColor" /> Generate Fakes</>
                  )}
                </button>
              </div>

              {/* Output */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Generated Output</h3>
                  {generatedImages.length > 0 && (
                    <a
                      href={generatedImages[0]}
                      download="synthetic_leaf.png"
                      className="text-sm text-green-600 dark:text-green-400 font-medium hover:text-green-700 flex items-center gap-1 transition-colors"
                    >
                      <Download size={16} /> Export
                    </a>
                  )}
                </div>

                <div className="flex-grow flex items-center justify-center">
                  {isGenerating ? (
                    <div className="text-center w-full max-w-sm mx-auto">
                      <div className="relative h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2.5, ease: 'easeInOut' }}
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-emerald-500"
                        />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 animate-pulse text-sm">
                        Running Generator Network…
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">
                        z ~ N(0,I) → DCGAN → 3×128×128
                      </p>
                    </div>
                  ) : generatedImages.length > 0 ? (
                    <div className={`grid gap-3 w-full ${numImages <= 4 ? 'grid-cols-2' : numImages <= 9 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                      {generatedImages.map((src, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.06, type: 'spring', stiffness: 200 }}
                          className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group bg-slate-100 dark:bg-slate-900"
                        >
                          <img
                            src={src} alt={`Synthetic leaf ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                            fake_{idx + 1}.png
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 dark:text-slate-600 max-w-sm">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <ImageIcon size={32} className="opacity-40" />
                      </div>
                      <p className="font-medium">Configure settings and click <strong className="text-slate-600 dark:text-slate-400">Generate Fakes</strong> to synthesise artificial disease imagery.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Metrics Tab ───────────────────────────────────────────────────── */}
          {activeTab === 'metrics' && (
            <div className="space-y-8">
              {metricsLoading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                  <div className="flex flex-col items-center gap-4 text-slate-400">
                    <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-green-500 rounded-full animate-spin" />
                    <p>Loading training metrics…</p>
                  </div>
                </div>
              ) : metrics ? (
                <>
                  {/* Status banner */}
                  <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border ${
                    metricsReal
                      ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300'
                      : 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  }`}>
                    <Activity size={16} />
                    {metricsReal
                      ? '✓ Showing real training data from outputs/training_losses.json'
                      : 'Showing simulated realistic curves — run training to see real data'}
                  </div>

                  {/* Summary stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Final G Loss', value: metrics.g_losses?.at(-1)?.toFixed(4), color: 'text-green-600 dark:text-green-400' },
                      { label: 'Final D Loss', value: metrics.d_losses?.at(-1)?.toFixed(4), color: 'text-indigo-600 dark:text-indigo-400' },
                      { label: 'Min FID Score', value: Math.min(...(metrics.fid_scores || [0])).toFixed(1), color: 'text-amber-600 dark:text-amber-400' },
                      { label: 'Epochs Trained', value: metrics.epochs?.length, color: 'text-slate-800 dark:text-white' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                        <p className={`text-2xl font-black ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* G+D Loss Chart */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
                      Generator vs Discriminator Loss
                    </h3>
                    <LossChart
                      epochs={metrics.epochs}
                      gLosses={metrics.g_losses}
                      dLosses={metrics.d_losses}
                    />
                  </div>

                  {/* FID Chart */}
                  {metrics.fid_scores?.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">FID Score over Training</h3>
                      <FidChart epochs={metrics.epochs} fidScores={metrics.fid_scores} />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 text-slate-400 dark:text-slate-600">
                  <Activity size={40} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Could not reach backend</p>
                  <p className="text-sm mt-1">Start the server with: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">python backend/app.py</code></p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
