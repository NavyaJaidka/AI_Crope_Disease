import React from 'react';
import { Leaf, Cpu, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-green-500/50 dark:hover:border-green-500/50 transition-colors group"
  >
    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400">{description}</p>
  </motion.div>
);

const Features = () => {
  return (
    <div className="py-20 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden" id="features">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-green-400/10 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-400/10 blur-3xl rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4"
          >
            Powered by Deep Learning
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400"
          >
            Our system utilizes state-of-the-art Generative Adversarial Networks to synthesize highly realistic crop disease imagery for dataset augmentation.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Cpu}
            title="DCGAN Architecture"
            description="Built on robust Deep Convolutional Generative Adversarial Networks for stable training and high-fidelity output generation."
            delay={0.2}
          />
          <FeatureCard 
            icon={Leaf}
            title="PlantVillage Dataset"
            description="Trained on thousands of curated agricultural images across 38 distinct crop disease classes."
            delay={0.3}
          />
          <FeatureCard 
            icon={Layers}
            title="Data Augmentation"
            description="Expands limited medical agricultural datasets to train more robust and accurate plant disease detection models."
            delay={0.4}
          />
        </div>
      </div>
    </div>
  );
};

export default Features;
