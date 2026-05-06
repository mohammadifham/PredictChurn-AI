import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../context/AuthContext';
import { predictionAPI } from '../utils/api';
import { AlertCircle, CheckCircle2, BarChart3, Layers, Database, Zap, Shield, Info } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [modelInfo, setModelInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelInfo();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?next=/dashboard');
    }
  }, [authLoading, router, user]);

  const fetchModelInfo = async () => {
    try {
      const response = await predictionAPI.getModelInfo();
      setModelInfo(response.data);
    } catch (err) {
      setError('Failed to fetch model information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-cyan-300/80 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authLoading && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-12 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-cyan-400/30 glass-dark text-cyan-300 text-sm font-medium mb-5">
            <Info className="w-4 h-4" />
            <span>Dashboard overview</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Model dashboard</h1>
          <p className="text-lg md:text-xl text-cyan-300/75 leading-relaxed">
            A simple overview of the prediction model, the fields it uses, and what each section means.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-400/50 rounded-lg flex items-start space-x-3 backdrop-blur-xl">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {modelInfo && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyan-300/70 mb-1">Total fields</p>
                    <p className="text-3xl font-bold text-cyan-300">{modelInfo.features.length}</p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-cyan-400/40 group-hover:text-cyan-400/80 transition-all" />
                </div>
              </div>

              <div className="card group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyan-300/70 mb-1">Number inputs</p>
                    <p className="text-3xl font-bold text-cyan-300">{modelInfo.numeric_features.length}</p>
                  </div>
                  <Database className="w-12 h-12 text-cyan-400/40 group-hover:text-cyan-400/80 transition-all" />
                </div>
              </div>

              <div className="card group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyan-300/70 mb-1">Choice fields</p>
                    <p className="text-3xl font-bold text-cyan-300">{modelInfo.categorical_features.length}</p>
                  </div>
                  <Layers className="w-12 h-12 text-cyan-400/40 group-hover:text-cyan-400/80 transition-all" />
                </div>
              </div>

              <div className="card group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyan-300/70 mb-1">System status</p>
                    <p className="text-3xl font-bold text-cyan-300">Ready</p>
                  </div>
                  <Shield className="w-12 h-12 text-cyan-400/40 group-hover:text-cyan-400/80 transition-all" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-cyan-300 mb-2 flex items-center space-x-2">
                    <Zap className="w-6 h-6" />
                    <span>Number inputs</span>
                  </h2>
                  <p className="text-sm text-cyan-300/70">These are entered as numbers, such as tenure or monthly charges.</p>
                </div>
                <div className="space-y-3">
                  {modelInfo.numeric_features.map((feature, idx) => (
                    <div key={feature} className="flex items-center justify-between p-3 glass-dark rounded-lg border border-cyan-400/30 hover:border-cyan-400/50 transition-all">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        <span className="font-medium text-cyan-300">{feature.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-sm text-cyan-300/60">
                        Default: <span className="font-semibold text-cyan-300">{modelInfo.numeric_defaults[feature]?.toFixed(2)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-cyan-300 mb-2 flex items-center space-x-2">
                    <Layers className="w-6 h-6" />
                    <span>Choice fields</span>
                  </h2>
                  <p className="text-sm text-cyan-300/70">These are dropdown selections such as contract type or payment method.</p>
                </div>
                <div className="space-y-3">
                  {modelInfo.categorical_features.map((feature, idx) => (
                    <div key={feature} className="p-3 glass-dark rounded-lg border border-purple-400/30 hover:border-purple-400/50 transition-all">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 text-slate-950 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        <span className="font-medium text-cyan-300">{feature.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="ml-8 text-sm text-cyan-300/70 flex flex-wrap gap-2">
                        {modelInfo.categorical_classes[feature]?.map((option) => (
                          <span
                            key={option}
                            className="inline-block glass-dark text-cyan-300 px-2 py-1 rounded text-xs font-medium border border-cyan-400/30"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">Model details</h2>
              <p className="text-sm text-cyan-300/70 mb-6">This section gives a quick summary of how the model is set up.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-dark rounded-xl p-4 border border-cyan-400/20">
                  <p className="text-sm text-cyan-300/60 mb-2">Model type</p>
                  <p className="text-lg font-semibold text-cyan-300">Random Forest</p>
                </div>
                <div className="glass-dark rounded-xl p-4 border border-cyan-400/20">
                  <p className="text-sm text-cyan-300/60 mb-2">Framework</p>
                  <p className="text-lg font-semibold text-cyan-300">scikit-learn</p>
                </div>
                <div className="glass-dark rounded-xl p-4 border border-cyan-400/20">
                  <p className="text-sm text-cyan-300/60 mb-2">Target</p>
                  <p className="text-lg font-semibold text-cyan-300">Churn</p>
                </div>
                <div className="glass-dark rounded-xl p-4 border border-cyan-400/20">
                  <p className="text-sm text-cyan-300/60 mb-2">API status</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <p className="text-lg font-semibold text-cyan-400">Connected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
