import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ShieldCheck, 
  Brain, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Lock, 
  Languages, 
  Maximize2 
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden text-slate-100">
      {/* Background ambient orbs */}
      <div className="glow-orb glow-orb-primary w-[500px] h-[500px] top-[-10%] left-[-10%]" />
      <div className="glow-orb glow-orb-secondary w-[600px] h-[600px] bottom-[-20%] right-[-10%]" />

      {/* Header */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex justify-between items-center border-b border-slate-900/60 bg-slate-950/20 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            SmartSumm <span className="text-brand-400">AI</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold hover:border-slate-700 transition-all flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-sm font-semibold text-white shadow-lg shadow-brand-600/10 hover:shadow-brand-600/20 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Content Summarization
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400"
          >
            Instant Clarity.<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-brand-500 to-cyan-400">
              Zero Noise.
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed mb-12 max-w-2xl mx-auto"
          >
            Condense long-form documents, PDFs, DOCX, and articles in seconds. Swap seamlessly between ultra-factual extractive models and creative AI summaries.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20"
          >
            <Link 
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 font-bold text-white shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              Start Summarizing Free 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/60 border border-slate-800 font-bold text-slate-300 hover:text-white hover:bg-slate-900 hover:border-slate-700 transition-all text-center"
            >
              Explore Modes
            </a>
          </motion.div>
        </motion.div>

        {/* Feature Grid / Modes Display */}
        <section id="features" className="pt-24 border-t border-slate-900/80">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
              Two Tailored Summarization Modes
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every document is unique. Choose the exact style that matches your analytical needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mode 1 Card */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="glass p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Exact Content Summary</h3>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/20">
                  Non-Hallucinating Extractive Mode
                </span>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  This mode uses a custom local TF-IDF frequency NLP parser to scan your files, rank sentence density, and pull exact phrases directly from the text. Perfect for legal audits, research reviews, and strict factual study notes.
                </p>
              </div>
              <ul className="space-y-3 border-t border-slate-800/60 pt-6">
                <li className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% factual accuracy — zero generated sentences</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Returns key original sentences in order of appearance</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Formatted as elegant, copyable bullet-points</span>
                </li>
              </ul>
            </motion.div>

            {/* Mode 2 Card */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="glass p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all duration-500" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6">
                  <Brain className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Smart AI Summary</h3>
                <span className="inline-block px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold mb-4 border border-brand-500/20">
                  Abstractive AI Explanation Mode
                </span>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Powered by advanced AI models, this mode reads, synthesizes, and rewrites complex texts into super simplified, conversational paragraphs. It simplifies dense jargon and generates explanatory analogies that are easy to digest.
                </p>
              </div>
              <ul className="space-y-3 border-t border-slate-800/60 pt-6">
                <li className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Translates dense, academic wording into plain language</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Adds easy-to-understand analogies and metaphors</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Enables downstream AI chat sessions on your documents</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid Details */}
        <section className="pt-32">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <Clock className="w-8 h-8 text-brand-400 mb-4" />
              <h4 className="font-bold text-white mb-2">Instant Speeds</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extract summaries from 50-page PDFs in less than 3 seconds with serverless acceleration.
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <Languages className="w-8 h-8 text-brand-400 mb-4" />
              <h4 className="font-bold text-white mb-2">Multiple Document Formats</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Support for PDF, DOCX, and direct plain text pastes with custom local text decoders.
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <Maximize2 className="w-8 h-8 text-brand-400 mb-4" />
              <h4 className="font-bold text-white mb-2">Adjustable Length</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose between Short (100w), Medium (250w), or Detailed (500w) summaries at will.
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <Lock className="w-8 h-8 text-brand-400 mb-4" />
              <h4 className="font-bold text-white mb-2">Private & Protected</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your documents are securely siloed. Features JWT account access with zero public indexing.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 py-10 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} SmartSumm AI. Designed for extreme clarity. All rights reserved.</p>
      </footer>
    </div>
  );
}
