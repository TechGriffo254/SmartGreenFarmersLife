import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, X, AlertCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import axios from 'axios';
import toast from 'react-hot-toast';

const PestDetection = () => {
  const { t, i18n } = useTranslation();
  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImagePreview(imageSrc);
    setShowCamera(false);
    
    // Convert base64 to blob
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        analyzeImage(file);
      });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      analyzeImage(file);
    }
  };

  const analyzeImage = async (file) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      formData.append('language', i18n.language);

      const response = await axios.post(
        `${API_URL}/api/pest/detect`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setResult(response.data);
      
      if (response.data.detections.length === 0) {
        toast.success(t('pestDetection.noDetection'));
      } else {
        toast.success(t('common.success'));
      }
    } catch (error) {
      console.error('Pest detection error:', error);
      toast.error(t('pestDetection.error'));
      setResult({ error: true, message: error.response?.data?.message || error.message });
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setResult(null);
    setShowCamera(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <h1 className="text-3xl font-bold">{t('pestDetection.title')}</h1>
          <p className="mt-2 text-green-100">
            {t('nav.pestDetection')} - AI-powered YOLO11
          </p>
        </div>

        <div className="p-6">
          {/* Upload/Capture Buttons */}
          {!imagePreview && !showCamera && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setShowCamera(true)}
                className="flex items-center justify-center gap-3 p-8 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
              >
                <Camera size={32} className="text-green-600" />
                <span className="text-lg font-medium">{t('pestDetection.takePhoto')}</span>
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
              <h2 className="text-2xl font-bold text-gray-800">{t('pestDetection.results')}</h2>
              
              {result.detections.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <p className="text-lg text-green-800">{t('pestDetection.noDetection')}</p>
                </div>
              ) : (
                <>
                  {/* Detections List */}
                  <div className="grid gap-4">
                    {result.detections.map((detection, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">
                              🐛 {detection.label}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {t('pestDetection.confidence')}: {(detection.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            detection.confidence > 0.8
                              ? 'bg-red-600 text-white'
                              : detection.confidence > 0.6
                              ? 'bg-orange-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }`}>
                            {detection.confidence > 0.8 ? t('alerts.critical') : 
                             detection.confidence > 0.6 ? t('alerts.warning') : 
                             t('alerts.info')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Recommendation */}
                  {result.recommendation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="text-blue-600" />
                        {t('pestDetection.recommendation')}
                      </h3>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">{result.recommendation}</p>
                      </div>
                    </div>
                  )}

                  {/* Processing Info */}
                  <div className="text-sm text-gray-500 text-center">
                    <p>Model: {result.modelUsed}</p>
                    <p>Processing time: {(result.processingTime / 1000).toFixed(2)}s</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Error */}
          {result && result.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-800">{result.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PestDetection;
