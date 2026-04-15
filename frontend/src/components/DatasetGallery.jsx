import React from 'react';
import { motion } from 'framer-motion';

const diseases = [
  {
    name: 'Early Blight',
    latin: 'Alternaria solani',
    severity: 'Moderate',
    severityColor: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-700/50',
    description: 'Dark brown concentric ring lesions starting on older leaves. One of the most common tomato diseases worldwide.',
    treatment: 'Copper-based fungicide + remove infected leaves',
    imgUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop&q=80',
    gradient: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-200 dark:border-amber-800/40',
    dot: 'bg-amber-500',
  },
  {
    name: 'Late Blight',
    latin: 'Phytophthora infestans',
    severity: 'Severe',
    severityColor: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-700/50',
    description: 'Water-soaked, rapidly expanding lesions with white mold on leaf undersides. Caused the Great Irish Famine of 1845.',
    treatment: 'Chlorothalonil fungicide + destroy infected plants',
    imgUrl: 'https://images.unsplash.com/photo-1550159930-40066082a4fc?w=400&h=400&fit=crop&q=80',
    gradient: 'from-red-500/20 to-rose-500/20',
    border: 'border-red-200 dark:border-red-800/40',
    dot: 'bg-red-500',
  },
  {
    name: 'Leaf Mold',
    latin: 'Passalora fulva',
    severity: 'Moderate',
    severityColor: 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-700/50',
    description: 'Pale green-yellow spots on upper leaf surface with olive-green mold on the underside. Thrives in humid greenhouses.',
    treatment: 'Improve air circulation + mancozeb fungicide',
    imgUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&q=80',
    gradient: 'from-orange-500/20 to-yellow-500/20',
    border: 'border-orange-200 dark:border-orange-800/40',
    dot: 'bg-orange-500',
  },
  {
    name: 'Healthy',
    latin: 'Solanum lycopersicum',
    severity: 'None',
    severityColor: 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-700/50',
    description: 'Vibrant green leaves with no lesions, spots, or discolouration. Healthy tomato plants can yield up to 15kg per plant.',
    treatment: 'Regular monitoring + balanced NPK fertilisation',
    imgUrl: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400&h=400&fit=crop&q=80',
    gradient: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-200 dark:border-green-800/40',
    dot: 'bg-green-500',
  },
];

const DiseaseCard = ({ disease, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`group relative bg-white dark:bg-slate-800 rounded-2xl border ${disease.border} overflow-hidden hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/80 transition-all duration-500 hover:-translate-y-2`}
  >
    {/* Image */}
    <div className="relative h-48 overflow-hidden">
      <img
        src={disease.imgUrl}
        alt={`${disease.name} example`}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        onError={e => { e.target.style.display = 'none'; }}
      />
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b ${disease.gradient} from-transparent to-white dark:to-slate-800`} />
      {/* Severity badge */}
      <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full border ${disease.severityColor}`}>
        {disease.severity}
      </span>
    </div>

    {/* Content */}
    <div className="p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${disease.dot}`} />
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{disease.name}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">{disease.latin}</p>
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{disease.description}</p>
      <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
        <span className="text-base mt-0.5 flex-shrink-0">💊</span>
        <p className="text-xs text-slate-600 dark:text-slate-400">{disease.treatment}</p>
      </div>
    </div>
  </motion.div>
);

const DatasetGallery = () => (
  <section className="py-24 bg-slate-50 dark:bg-slate-900/50 overflow-hidden" id="dataset">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
          PlantVillage Dataset
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
          Disease Class Reference
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          The GAN was trained on these four primary tomato disease classes from the PlantVillage
          benchmark dataset — 54,309 images across 38 classes.
        </p>

        {/* Dataset stats bar */}
        <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-6 bg-white dark:bg-slate-800 rounded-2xl px-8 py-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          {[
            { label: 'Source', value: 'PlantVillage (Kaggle)' },
            { label: 'Resolution', value: '128 × 128 px' },
            { label: 'Normalisation', value: '[-1, 1]' },
            { label: 'Augmentation', value: 'DCGAN Synthetic' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {diseases.map((d, i) => (
          <DiseaseCard key={d.name} disease={d} delay={i * 0.1} />
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-slate-400 dark:text-slate-600 mt-10"
      >
        GAN-generated synthetic images from these classes are saved to{' '}
        <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
          outputs/synthetic_leaves/
        </code>
        {' '}and can be directly used for data augmentation.
      </motion.p>
    </div>
  </section>
);

export default DatasetGallery;
