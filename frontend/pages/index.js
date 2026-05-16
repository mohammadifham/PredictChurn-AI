import { useEffect, useState } from 'react';
import { useContext } from 'react';
import Link from 'next/link';
import { ArrowRight, Brain, Shield, TrendingUp, BarChart3, Zap, Lock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'Advanced ML Model',
      description: 'Powered by Random Forest algorithm for highly accurate predictions',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Predictions',
      description: 'Get instant churn predictions with confidence scores',
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Analytics',
      description: 'View detailed model insights and prediction history',
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Enterprise-grade user authentication and data protection',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Sub-second prediction response times',
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Your data is encrypted and never stored without permission',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-20 relative overflow-hidden">
      {showSplash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" />
          <div className="relative z-10 w-full max-w-lg glass-base rounded-[2rem] border border-cyan-400/25 shadow-2xl shadow-cyan-500/30 p-8 sm:p-10 text-center">
            <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <span className="text-slate-950 text-2xl font-black">CP</span>
            </div>

            <p className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 mb-5">
              Loading workspace
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Churn Predictor
            </h1>
            <p className="text-cyan-300/75 mb-8 leading-relaxed">
              Preparing your dashboard, prediction tools, and model insights.
            </p>

            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden border border-cyan-400/20">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-lg shadow-cyan-500/60 splash-bar" />
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.28em] text-cyan-300/50">
              Secure • Fast • Ready
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block px-4 py-2 glass-dark text-cyan-300 rounded-full text-sm font-semibold border border-cyan-500/50 shadow-lg shadow-cyan-500/30">
                Advanced Churn Prediction System
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Predict Customer Churn with
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent"> AI Precision</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-cyan-300/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Advanced machine learning system that predicts customer churn with high accuracy, helping you retain valuable customers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href={user ? '/predict' : '/login?next=/predict'} className="btn-primary-large inline-flex items-center justify-center">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href={user ? '/dashboard' : '/login?next=/dashboard'} className="btn-secondary-outline inline-flex items-center justify-center">
                View Dashboard
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="glass-dark p-6 rounded-2xl border border-cyan-500/30">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">21</div>
                <div className="text-sm text-cyan-300/70 mt-2">Features</div>
              </div>
              <div className="glass-dark p-6 rounded-2xl border border-cyan-500/30">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">&lt;1ms</div>
                <div className="text-sm text-cyan-300/70 mt-2">Response</div>
              </div>
              <div className="glass-dark p-6 rounded-2xl border border-cyan-500/30">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">99%</div>
                <div className="text-sm text-cyan-300/70 mt-2">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">Everything you need to predict and manage customer churn</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="card-hover group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all border border-cyan-400/30">
                    <Icon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-cyan-300 mb-2">{feature.title}</h3>
                  <p className="text-cyan-300/70">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="glass-dark p-12 rounded-3xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Reduce Churn?</h2>
              <p className="text-xl text-cyan-300/80 mb-8">Start making data-driven decisions today with our powerful prediction system.</p>
              <Link href={user ? '/predict' : '/login?next=/predict'} className="inline-flex items-center btn-primary-large">
                Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
