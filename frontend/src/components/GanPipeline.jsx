import React from 'react';
import { motion } from 'framer-motion';

// ─── Animated arrow ───────────────────────────────────────────────────────────
const Arrow = ({ label }) => (
  <div className="flex flex-col items-center justify-center gap-1 px-2">
    <motion.div
      animate={{ x: [0, 8, 0] }}
      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
      className="text-slate-400 dark:text-slate-500 text-2xl select-none"
    >→</motion.div>
    {label && <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono whitespace-nowrap">{label}</span>}
  </div>
);

// ─── Flow Node ────────────────────────────────────────────────────────────────
const Node = ({ title, subtitle, color, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 ${color} bg-white dark:bg-slate-800 px-5 py-4 shadow-lg text-center min-w-[110px]`}
  >
    <div className="text-3xl">{icon}</div>
    <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{title}</p>
    {subtitle && <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{subtitle}</p>}
  </motion.div>
);

// ─── Stat pill ────────────────────────────────────────────────────────────────
const Pill = ({ label, value, color }) => (
  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
    <span className="opacity-70">{label}</span>
    <span>{value}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const GanPipeline = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden" id="architecture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
            Architecture Deep Dive
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            How the DCGAN Works
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Two neural networks locked in an adversarial game — the Generator learns to create
            ever-more realistic leaf images while the Discriminator learns to spot the fakes.
          </p>
        </motion.div>

        {/* Pipeline Diagram */}
        <div className="relative bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-xl overflow-hidden">

          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />

          {/* Main flow — scrollable on mobile */}
          <div className="overflow-x-auto pb-4">
            <div className="flex items-center justify-center gap-1 min-w-max mx-auto">

              {/* 1. Noise Input */}
              <Node
                title="Noise Vector"
                subtitle="z ~ N(0,I) · 100-d"
                color="border-blue-400 dark:border-blue-500"
                icon="🎲"
                delay={0}
              />

              <Arrow label="latent" />

              {/* 2. Generator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="relative flex flex-col items-center gap-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl px-6 py-5 shadow-xl shadow-green-500/30 text-white min-w-[120px] text-center"
              >
                <span className="text-3xl">⚡</span>
                <p className="text-sm font-bold leading-tight">Generator</p>
                <p className="text-[10px] opacity-80 font-mono">DCGAN · 11M params</p>
                {/* Animated glow */}
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-2xl bg-green-400/20 blur-md"
                />
              </motion.div>

              <Arrow label="fake image" />

              {/* 3. Fake Image */}
              <Node
                title="Fake Leaf"
                subtitle="3 × 128 × 128"
                color="border-emerald-400 dark:border-emerald-500"
                icon="🍃"
                delay={0.25}
              />

              <Arrow />

              {/* 4. Discriminator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
                className="relative flex flex-col items-center gap-2 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl px-6 py-5 shadow-xl shadow-purple-500/30 text-white min-w-[120px] text-center"
              >
                <span className="text-3xl">🔍</span>
                <p className="text-sm font-bold leading-tight">Discriminator</p>
                <p className="text-[10px] opacity-80 font-mono">DCGAN · 11M params</p>
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                  className="absolute inset-0 rounded-2xl bg-purple-400/20 blur-md"
                />
              </motion.div>

              <Arrow label="real / fake?" />

              {/* 5. Output */}
              <div className="flex flex-col gap-3">
                <Node
                  title="Real ✓"
                  subtitle="D(x) → 1"
                  color="border-green-400 dark:border-green-500"
                  icon="✅"
                  delay={0.45}
                />
                <Node
                  title="Fake ✗"
                  subtitle="D(G(z)) → 0"
                  color="border-red-400 dark:border-red-500"
                  icon="❌"
                  delay={0.5}
                />
              </div>

            </div>

            {/* Real dataset arrow coming UP into Discriminator */}
            <div className="flex justify-center mt-8">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl px-5 py-3">
                  <span className="text-2xl">🌿</span>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Real PlantVillage Images</p>
                    <p className="text-[10px] text-slate-400 font-mono">54,309 images · 38 disease classes</p>
                  </div>
                  <motion.span
                    animate={{ x: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-amber-500 text-lg ml-2"
                  >→</motion.span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">also fed to Discriminator</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Training objective pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Pill label="G objective" value="minimise BCE(D(G(z)), 1)" color="border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300" />
            <Pill label="D objective" value="minimise BCE(D(x),1) + BCE(D(G(z)),0)" color="border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300" />
            <Pill label="Optimizer" value="Adam β₁=0.5, lr=2e-4" color="border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
            <Pill label="Loss" value="Binary Cross-Entropy" color="border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-300" />
          </motion.div>
        </div>

        {/* Architecture tables */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: '⚡ Generator Layers',
              color: 'from-green-500 to-emerald-600',
              rows: [
                ['Linear + BN + ReLU', '512 × 4 × 4'],
                ['ConvTranspose 512→512', '512 × 8 × 8'],
                ['ConvTranspose 512→256', '256 × 16 × 16'],
                ['ConvTranspose 256→128', '128 × 32 × 32'],
                ['ConvTranspose 128→64', '64 × 64 × 64'],
                ['ConvTranspose 64→3 + Tanh', '3 × 128 × 128 ✓'],
              ],
            },
            {
              title: '🔍 Discriminator Layers',
              color: 'from-violet-500 to-purple-700',
              rows: [
                ['Conv 3→64 + LeakyReLU', '64 × 64 × 64'],
                ['Conv 64→128 + BN', '128 × 32 × 32'],
                ['Conv 128→256 + BN', '256 × 16 × 16'],
                ['Conv 256→512 + BN', '512 × 8 × 8'],
                ['Conv 512→1024 + BN', '1024 × 4 × 4'],
                ['Flatten + Linear + Sigmoid', 'scalar ∈ [0,1] ✓'],
              ],
            },
          ].map(({ title, color, rows }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${color} px-5 py-3`}>
                <h3 className="text-sm font-bold text-white">{title}</h3>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="px-4 py-2 text-left text-slate-500 dark:text-slate-400 font-semibold">Layer</th>
                    <th className="px-4 py-2 text-right text-slate-500 dark:text-slate-400 font-semibold">Output Shape</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([layer, shape], i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-2 font-mono text-slate-700 dark:text-slate-300">{layer}</td>
                      <td className="px-4 py-2 font-mono text-right text-slate-500 dark:text-slate-500">{shape}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default GanPipeline;
