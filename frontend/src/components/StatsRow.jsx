import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

// ─── Animated Counter ─────────────────────────────────────────────────────────
const Counter = ({ target, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ value, suffix, label, description, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="relative overflow-hidden bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 text-center group hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/80 transition-all duration-300 hover:-translate-y-1"
  >
    {/* Gradient blob background */}
    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity ${gradient}`} />

    <p className={`text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
      <Counter target={value} suffix={suffix} />
    </p>
    <p className="text-base font-bold text-slate-800 dark:text-slate-100">{label}</p>
    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{description}</p>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const StatsRow = () => (
  <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          value={54309}
          suffix=""
          label="Training Images"
          description="PlantVillage dataset"
          gradient="from-green-500 to-emerald-600"
          delay={0}
        />
        <StatCard
          value={38}
          suffix=""
          label="Disease Classes"
          description="Across 14 crop species"
          gradient="from-blue-500 to-indigo-600"
          delay={0.1}
        />
        <StatCard
          value={22}
          suffix="M+"
          label="Parameters"
          description="Generator + Discriminator"
          gradient="from-purple-500 to-violet-600"
          delay={0.2}
        />
        <StatCard
          value={50}
          suffix=""
          label="Training Epochs"
          description="128×128 RGB output"
          gradient="from-orange-500 to-amber-600"
          delay={0.3}
        />
      </div>
    </div>
  </section>
);

export default StatsRow;
