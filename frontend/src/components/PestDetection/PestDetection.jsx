import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, X, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PestDetection = () => {
  const { t, i18n } = useTranslation();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [remedy, setRemedy] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loadingRemedy, setLoadingRemedy] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const language = i18n.language || 'sw';
  const isSwahili = language === 'sw';

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(isSwahili ? 'Picha ni kubwa sana (max 5MB)' : 'Image too large (max 5MB)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        analyzeImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Image) => {
    setAnalyzing(true);
    setResult(null);
    setRemedy(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('language', i18n.language);

      const response = await api.post('/pest/detect', {
        imageBase64: base64Image
      });

      if (response.data.success) {
        setResult(response.data.data);
        
        if (response.data.data.detections.length === 0) {
          toast.success(isSwahili ? 'Hakuna wadudu waliogundulika' : 'No pests detected');
        } else {
          toast.success(isSwahili ? 'Wadudu wamegundulika!' : 'Pests detected!');
          
          // Auto-fetch remedy for detected diseases
          const diseaseLabels = response.data.data.detections
            .filter(d => d.diseaseType === 'disease')
            .map(d => d.label);
          
          if (diseaseLabels.length > 0) {
            fetchRemedy(diseaseLabels);
          }
        }
      }
    } catch (error) {
      console.error('Pest detection error:', error);
      
      if (error.response?.status === 503) {
        toast.error(isSwahili 
          ? 'Model inapakia, jaribu tena baada ya sekunde 20' 
          : 'Model loading, retry in 20 seconds'
        );
      } else {
        toast.error(isSwahili ? 'Hitilafu katika kugundua wadudu' : 'Pest detection failed');
      }
      
      setResult({ error: true, message: error.response?.data?.message || error.message });
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchRemedy = async (pestLabels) => {
    setLoadingRemedy(true);
    try {
      const response = await api.post('/ai/pest-remedy', {
        pestLabels,
        language
      });

      if (response.data.success) {
        setRemedy(response.data.data.remedy);
      }
    } catch (error) {
      console.error('Remedy fetch error:', error);
    } finally {
      setLoadingRemedy(false);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setResult(null);
    setRemedy(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <h1 className="text-3xl font-bold">
            {isSwahili ? '🔬 Kigundua Wadudu' : '🔬 Pest Scanner'}
          </h1>
          <p className="mt-2 text-green-100">
            {isSwahili 
              ? 'Piga picha ya mmea kugundua magonjwa na wadudu' 
              : 'Capture plant image to detect diseases and pests'}
          </p>
        </div>

        <div className="p-6">
          {/* Upload Button */}
          {!imagePreview && (
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                capture="environment"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 p-8 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
              >
                <Upload size={32} className="text-green-600" />
                <span className="text-lg font-medium">
                  {isSwahili ? 'Pakia au Piga Picha' : 'Upload or Capture Photo'}
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-3 p-8 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
              >
                <Upload size={32} className="text-green-600" />
                <span className="text-lg font-medium">{t('pestDetection.uploadImage')}</span>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Camera View */}
          {showCamera && (
            <div className="relative mb-6">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg"
                videoConstraints={{
                  facingMode: 'environment'
                }}
              />
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={capturePhoto}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  📸 {t('pestDetection.takePhoto')}
                </button>
                <button
                  onClick={() => setShowCamera(false)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-6">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={reset}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Analyzing Indicator */}
          {analyzing && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
              <p className="text-xl font-medium text-gray-700">{t('pestDetection.analyzing')}</p>
              <p className="text-sm text-gray-500 mt-2">This may take up to 30 seconds...</p>
            </div>
          )}

          {/* Results */}
          {result && !result.error && result.detections && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isSwahili ? 'Matokeo' : 'Results'}
                </h2>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  <RefreshCw size={16} />
                  {isSwahili ? 'Jaribu Tena' : 'Try Again'}
                </button>
              </div>
              
              {result.detections.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <p className="text-lg text-green-800">
                    {isSwahili ? '✅ Mmea ni mzima!' : '✅ Plant appears healthy!'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Detections List */}
                  <div className="grid gap-4">
                    {result.detections.map((detection, index) => (
                      <div
                        key={index}
                        className={`rounded-lg p-4 border-2 ${
                          detection.diseaseType === 'healthy'
                            ? 'bg-green-50 border-green-300'
                            : 'bg-red-50 border-red-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">
                              {detection.diseaseType === 'healthy' ? '✅' : '⚠️'} {detection.label}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {isSwahili ? 'Uhakika' : 'Confidence'}: {detection.confidence}%
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            detection.confidence > 80
                              ? 'bg-red-600 text-white'
                              : detection.confidence > 60
                              ? 'bg-orange-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }`}>
                            {detection.confidence > 80 ? (isSwahili ? 'Juu' : 'High') : 
                             detection.confidence > 60 ? (isSwahili ? 'Wastani' : 'Medium') : 
                             (isSwahili ? 'Chini' : 'Low')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Remedy */}
                  {loadingRemedy ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center gap-3">
                      <Loader className="animate-spin" size={20} />
                      <span>{isSwahili ? 'Inatafuta dawa...' : 'Fetching remedy...'}</span>
                    </div>
                  ) : remedy ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="text-blue-600" />
                        {isSwahili ? '💊 Dawa Zinazopendekeza' : '💊 Recommended Remedy'}
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{remedy}</p>
                    </div>
                  ) : null}

                  {/* Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
                    <p>📊 {result.totalFound} {isSwahili ? 'wamegundulika' : 'detected'}</p>
                    <p className="mt-1">🕐 {new Date(result.timestamp).toLocaleString()}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Error */}
          {result && result.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600" size={24} />
                <div>
                  <h3 className="text-lg font-bold text-red-800">
                    {isSwahili ? 'Hitilafu' : 'Error'}
                  </h3>
                  <p className="text-red-700 mt-1">{result.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PestDetection;
