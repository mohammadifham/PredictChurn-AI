import { Zap } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-dark border-t border-cyan-500/20 shadow-2xl shadow-purple-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-bold text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text">Churn Predictor</span>
            </div>
            <p className="text-sm text-cyan-300/70">
              Advanced ML-powered PredictChurn AI system
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-cyan-300 mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/predict" className="text-cyan-300/70 hover:text-cyan-300 transition-colors duration-300 hover:shadow-md hover:shadow-cyan-500/30">Predictions</a></li>
              <li><a href="/dashboard" className="text-cyan-300/70 hover:text-cyan-300 transition-colors duration-300 hover:shadow-md hover:shadow-cyan-500/30">Dashboard</a></li>
              <li><a href="/" className="text-cyan-300/70 hover:text-cyan-300 transition-colors duration-300 hover:shadow-md hover:shadow-cyan-500/30">Features</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-cyan-500/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-cyan-300/60">
            &copy; {currentYear} Churn Predictor. All rights reserved.
          </p>
          <p className="text-sm text-cyan-300/60 mt-4 md:mt-0">Version 2.0.0</p>
        </div>
      </div>
    </footer>
  );
}
