import { motion } from 'framer-motion';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-500/20 to-accent-700/20 flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-10 h-10 text-accent-400" />
        </div>
        <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
        <p className="text-dark-300 mb-8">This page doesn't exist</p>
        <button onClick={() => navigate('/')} className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Go Home
        </button>
      </motion.div>
    </div>
  );
}
