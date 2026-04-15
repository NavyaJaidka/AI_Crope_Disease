import React, { useState, useEffect } from 'react';
import { Leaf, Menu, X, Github, Sun, Moon } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

import Features       from './components/Features';
import Dashboard      from './components/Dashboard';
import StatsRow       from './components/StatsRow';
import GanPipeline    from './components/GanPipeline';
import DatasetGallery from './components/DatasetGallery';
import DiseaseDetector from './components/DiseaseDetector';

function App() {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode]             = useState(() => {
    // Restore saved preference, or use system default
    const saved = localStorage.getItem('agriGanTheme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const { scrollY } = useScroll();
  const y1      = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Apply / remove  'dark' class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('agriGanTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features',    label: 'Architecture' },
    { href: '#demo',        label: 'Dashboard' },
    { href: '#detector',    label: 'Detect' },
    { href: '#dataset',     label: 'Dataset' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 py-3'
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <a href="#" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-green-500/30">
                <Leaf className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">
                Agri<span className="text-green-600 dark:text-green-400">GAN</span>
              </span>
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm font-medium text-slate-600 hover:text-green-600 dark:text-slate-300 dark:hover:text-green-400 transition-colors"
                >
                  {label}
                </a>
              ))}

              {/* Dark mode toggle */}
              <button
                id="theme-toggle"
                onClick={() => setDarkMode(d => !d)}
                aria-label="Toggle dark mode"
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700"
              >
                {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600" />}
              </button>

              <a
                href="https://github.com/navyajaidka/AI_Crop_Disease_GAN"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Github size={16} />
                <span>GitHub</span>
              </a>
            </div>

            {/* Mobile actions */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setDarkMode(d => !d)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700"
              >
                {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-600" />}
              </button>
              <button
                className="text-slate-600 dark:text-slate-300 hover:text-green-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 pb-4 pt-2 space-y-1"
          >
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400"
              >
                {label}
              </a>
            ))}
          </motion.div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex min-h-screen items-center justify-center -mt-20">

        {/* Decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Hero text */}
            <motion.div
              style={{ y: y1, opacity }}
              className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold mb-6 border border-green-200 dark:border-green-800/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                DCGAN Research Project · PlantVillage
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                Synthesizing{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-700">
                  Crop Health
                </span>{' '}
                with AI.
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Train robust agricultural disease detection models by augmenting limited datasets
                with highly realistic DCGAN-generated synthetic plant imagery.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <a
                  href="#demo"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full font-bold text-lg shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-1 hover:shadow-green-500/50 flex items-center justify-center gap-2"
                >
                  🚀 Launch Dashboard
                </a>
                <a
                  href="#detector"
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-full font-bold text-lg border-2 border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  🔍 Detect Disease
                </a>
              </div>
            </motion.div>

            {/* Hero terminal visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-green-400 to-blue-500 rounded-[3rem] rotate-6 opacity-20 dark:opacity-40 animate-pulse blur-xl" />
                <div className="absolute inset-0 bg-slate-900 dark:bg-slate-800 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col">
                  {/* Terminal header */}
                  <div className="h-10 bg-slate-800 dark:bg-slate-900 flex items-center px-4 gap-2 border-b border-slate-700">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-4 text-xs font-mono text-slate-400">train_gan.py — DCGAN — 50 epochs</span>
                  </div>
                  {/* Terminal body */}
                  <div className="p-6 font-mono text-sm text-green-400 flex-grow bg-[#0D1117] relative overflow-hidden">
                    <div
                      className="opacity-10 absolute inset-0 pointer-events-none"
                      style={{ backgroundImage: 'radial-gradient(circle, #4ade80 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}>
                      <p className="text-slate-300 mb-2">$ python training/train_gan.py</p>
                      <p className="mb-1 text-blue-400">Loading PlantVillage dataset...</p>
                      <p className="mb-4">Found 18,345 images in Tomato classes.</p>
                      <p className="text-yellow-400 mb-1">Initializing DCGAN...</p>
                      <p className="mb-1">Generator     : 11.2M parameters</p>
                      <p className="mb-4">Discriminator : 11.2M parameters</p>
                      <div className="space-y-1">
                        {[
                          ['1/50', '0.3421', '6.4312'],
                          ['2/50', '0.5123', '4.1235'],
                          ['3/50', '0.6432', '3.1245'],
                        ].map(([e, d, g]) => (
                          <p key={e}>Epoch [{e}] Loss_D: <span className="text-white">{d}</span> Loss_G: <span className="text-white">{g}</span></p>
                        ))}
                        <motion.p
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="text-green-300 font-bold"
                        >
                          Epoch [ 4/50] Loss_D: 0.7231 Loss_G: 2.1453 ▮
                        </motion.p>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [-15, 15, -15] }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                  className="absolute -right-12 -top-12 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700"
                >
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Resolution</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">128×128</p>
                </motion.div>

                <motion.div
                  animate={{ y: [15, -15, 15] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
                  className="absolute -left-12 -bottom-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Leaf size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Crop</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">Solanum lycopersicum</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <StatsRow />

      {/* ── Features / Architecture overview ───────────────────────────────── */}
      <Features />

      {/* ── GAN Pipeline diagram ───────────────────────────────────────────── */}
      <GanPipeline />

      {/* ── Interactive Dashboard ──────────────────────────────────────────── */}
      <Dashboard />

      {/* ── Disease Detector ───────────────────────────────────────────────── */}
      <DiseaseDetector />

      {/* ── Dataset Gallery ────────────────────────────────────────────────── */}
      <DatasetGallery />

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-white dark:bg-slate-950 py-12 border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Leaf className="text-green-600 dark:text-green-500 w-5 h-5" />
              <span className="font-bold text-lg text-slate-900 dark:text-white">AgriGAN</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
              Built with PyTorch DCGAN · React + Vite · Flask API · PlantVillage Dataset
            </p>
            <div className="flex gap-5 text-sm text-slate-400">
              <a href="https://arxiv.org/abs/1511.06434" target="_blank" rel="noreferrer" className="hover:text-green-500 transition-colors">DCGAN Paper</a>
              <a href="https://www.kaggle.com/datasets/emmarex/plantdisease" target="_blank" rel="noreferrer" className="hover:text-green-500 transition-colors">Dataset</a>
              <a href="https://github.com/navyajaidka/AI_Crop_Disease_GAN" target="_blank" rel="noreferrer" className="hover:text-green-500 transition-colors">GitHub</a>
            </div>
          </div>
          <p className="text-center text-xs text-slate-300 dark:text-slate-700 mt-8">
            © 2025 AI Crop Disease GAN Project · Advanced AI Systems Coursework
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
