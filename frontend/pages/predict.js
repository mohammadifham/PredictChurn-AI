import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../context/AuthContext';
import { predictionAPI } from '../utils/api';
import { AlertCircle, CheckCircle2, Zap } from 'lucide-react';

export default function Predict() {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [modelInfo, setModelInfo] = useState(null);
  const [modelInfoLoading, setModelInfoLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadModelInfo();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?next=/predict');
    }
  }, [authLoading, router, user]);

  const loadModelInfo = async () => {
    setModelInfoLoading(true);
    setError('');
    try {
      const response = await predictionAPI.getModelInfo();
      setModelInfo(response.data);
      const initial = {};
      response.data.features.forEach((feature) => {
        if (response.data.numeric_features.includes(feature)) {
          initial[feature] = response.data.numeric_defaults[feature] || 0;
        } else {
          const classes = response.data.categorical_classes[feature] || [];
          initial[feature] = classes[0] || '';
        }
      });
      setFormData(initial);
    } catch (err) {
      setError('Failed to fetch model information. Please retry.');
    }
    finally {
      setModelInfoLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field in modelInfo.numeric_defaults ? parseFloat(value) : value,
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setError('');
    setPrediction(null);
    setLoading(true);

    if (!modelInfo) {
      setError('Model information is not loaded yet. Please retry.');
      setLoading(false);
      return;
    }

    try {
      const response = await predictionAPI.predict(formData, user?.username || null);
      setPrediction(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && !user) {
    return null;
  }

  const numericFeatures = modelInfo?.features.filter((f) =>
    modelInfo.numeric_features.includes(f)
  ) || [];
  const categoricalFeatures = modelInfo?.features.filter((f) =>
    modelInfo.categorical_features.includes(f)
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-12 pt-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Make a Prediction</h1>
          <p className="text-xl text-cyan-300/80">Enter customer details to predict churn probability</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-400/50 rounded-lg flex items-start space-x-3 backdrop-blur-xl">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handlePredict} className="card">
              {!modelInfoLoading && numericFeatures.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-cyan-300 mb-6 flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Numeric Information</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {numericFeatures.map((feature) => (
                      <div key={feature}>
                        <label className="block text-sm font-semibold text-cyan-300 mb-2">
                          {feature.replace(/_/g, ' ')}
                        </label>
                        <input
                          type="number"
                          value={formData[feature] || ''}
                          onChange={(e) => handleInputChange(feature, e.target.value)}
                          className="input-field"
                          step="any"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!modelInfoLoading && categoricalFeatures.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-cyan-300 mb-6 flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Customer Profile</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoricalFeatures.map((feature) => (
                      <div key={feature}>
                        <label className="block text-sm font-semibold text-cyan-300 mb-2">
                          {feature.replace(/_/g, ' ')}
                        </label>
                        <select
                          value={formData[feature] || ''}
                          onChange={(e) => handleInputChange(feature, e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select an option</option>
                          {modelInfo.categorical_classes[feature]?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modelInfoLoading && (
                <div className="mb-6 p-4 rounded-lg border border-cyan-400/20 bg-cyan-500/10 text-cyan-200">
                  Loading prediction model fields...
                </div>
              )}

              {!modelInfoLoading && error && !modelInfo && (
                <div className="mb-6 p-4 rounded-lg border border-red-400/30 bg-red-500/10 text-red-200 flex items-center justify-between gap-4">
                  <p>{error}</p>
                  <button type="button" onClick={loadModelInfo} className="px-4 py-2 rounded bg-cyan-500 text-slate-950 font-semibold">
                    Retry
                  </button>
                </div>
              )}

              <div className="border-t border-cyan-500/20 pt-8 flex space-x-4">
                <button
                  type="submit"
                  disabled={loading || modelInfoLoading || !modelInfo}
                  className="flex-1 btn-primary-large flex items-center justify-center disabled:opacity-50"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {loading ? 'Analyzing...' : 'Get Prediction'}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-bold text-cyan-300 mb-4">Model Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-cyan-300/60">Total Features</p>
                  <p className="text-2xl font-bold text-cyan-300">{modelInfo.features.length}</p>
                </div>
                <div>
                  <p className="text-sm text-cyan-300/60">Model Type</p>
                  <p className="text-lg font-semibold text-cyan-300">Random Forest</p>
                </div>
                <div>
                  <p className="text-sm text-cyan-300/60">Accuracy</p>
                  <p className="text-2xl font-bold text-cyan-300">100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {prediction && (
          <div className="mt-12">
            <div className={`card border-2 ${prediction.prediction === 'Churn' ? 'border-red-400/50 bg-red-500/10' : 'border-cyan-400/50 bg-cyan-500/10'}`}>
              <div className="flex items-start space-x-6">
                <div>
                  {prediction.prediction === 'Churn' ? (
                    <AlertCircle className="w-12 h-12 text-red-400" />
                  ) : (
                    <CheckCircle2 className="w-12 h-12 text-cyan-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {prediction.prediction === 'Churn' ? 'High Churn Risk' : 'Low Churn Risk'}
                  </h2>
                  <p className={`text-lg font-semibold mb-4 ${prediction.prediction === 'Churn' ? 'text-red-400' : 'text-cyan-400'}`}>
                    {prediction.prediction}
                  </p>
                  <div className="flex items-center space-x-8">
                    <div>
                      <p className="text-sm text-cyan-300/60">Confidence Score</p>
                      <span className="text-3xl font-bold text-cyan-300">{(prediction.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <p className="text-sm text-cyan-300/60">Predicted At</p>
                      <p className="text-sm font-semibold text-cyan-300">{new Date(prediction.timestamp).toLocaleString()}</p>
                    </div>
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

