import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import { useAuthStore } from '../store/authStore';
import { NeuInput } from '../components/ui/NeuInput';
import { NeuButton } from '../components/ui/NeuButton';
import { Camera, Lock, UserPlus, Key, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

export const Login = () => {
  const navigate = useNavigate();
  const { register, login, loginWithFace, isRegistered, isAuthenticated } = useAuthStore();
  
  const [isLoginView, setIsLoginView] = useState(isRegistered);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);

  // Load Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoading(false);
      } catch (err) {
        console.error("Failed to load face-api models", err);
        setError("AI models failed to load. Please check internet connection.");
        setIsModelLoading(false);
      }
    };
    loadModels();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handlePasscodeAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLoginView) {
      if (login(passcode)) {
        navigate('/');
      } else {
        setError('Incorrect Passcode');
      }
    } else {
      if (passcode.length < 4) {
        setError('Passcode must be at least 4 digits');
        return;
      }
      register(passcode, null);
      navigate('/');
    }
  };

  const captureFace = useCallback(async () => {
    if (!webcamRef.current) {
      setError("Webcam not ready. Please wait.");
      return;
    }
    
    setIsScanning(true);
    setError('');

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError("Could not access camera feed");
        return;
      }

      const img = await faceapi.fetchImage(imageSrc);
      const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError("No face detected. Align your face in the box.");
        return;
      }

      const descriptorArray = Array.from(detection.descriptor);

      if (isLoginView) {
        if (loginWithFace(descriptorArray)) {
          navigate('/');
        } else {
          setError("Identity mismatch. Use passcode.");
        }
      } else {
        if (passcode.length < 4) {
          setError("Set a 4-digit passcode first to backup Face ID");
          return;
        }
        register(passcode, descriptorArray);
        navigate('/');
      }
    } catch (err) {
      console.error("Biometric capture failed", err);
      setError("Biometric capture failed. Try again.");
    } finally {
      setIsScanning(false);
    }
  }, [isLoginView, passcode, register, loginWithFace, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/10 rounded-full blur-[100px] animate-pulse delay-700" />

      <div className="w-full max-w-[500px] relative z-10">
        <motion.div 
          className="bg-background shadow-neu-up rounded-[40px] overflow-hidden min-h-[700px] flex flex-col relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="p-8 text-center pb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl shadow-neu-up flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-primary" size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Ravi Agency</h1>
            <p className="text-slate-500 text-sm font-medium">Smart Biometric Security</p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mx-8 p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger text-sm font-semibold mb-4 shadow-neu-down"
              >
                <AlertCircle size={18} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main View Sliding */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              {isLoginView ? (
                /* LOGIN VIEW (BOTTOM -> TOP SLIDE) */
                <motion.div 
                  key="login"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="p-8 flex flex-col gap-8 h-full"
                >
                  <div className="space-y-6">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-success rounded-[30px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                      <div className="relative bg-background rounded-[30px] p-2 shadow-neu-down overflow-hidden">
                        {isModelLoading ? (
                          <div className="aspect-video flex flex-col items-center justify-center gap-4 text-slate-400">
                            <Loader2 className="animate-spin" size={32} />
                            <span className="text-xs font-bold uppercase tracking-widest">Loading AI Models...</span>
                          </div>
                        ) : (
                          <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full aspect-video rounded-2xl object-cover scale-x-[-1]"
                          />
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={captureFace}
                      disabled={isScanning || isModelLoading}
                      className="w-full h-16 bg-background shadow-neu-up rounded-2xl flex items-center justify-center gap-3 text-primary font-bold active:shadow-neu-down transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                    >
                      {isScanning ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
                      {isScanning ? 'RECOGNIZING...' : 'SCAN FACE TO LOGIN'}
                    </button>
                  </div>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-slate-400 font-bold tracking-widest">OR USE PASSCODE</span></div>
                  </div>

                  <form onSubmit={handlePasscodeAuth} className="space-y-6">
                    <NeuInput 
                      label="Store Passcode" 
                      type="password" 
                      value={passcode} 
                      onChange={e=>setPasscode(e.target.value)} 
                      icon={<Key size={18} />}
                      placeholder="••••"
                    />
                    <NeuButton type="submit" variant="primary" className="w-full h-14" icon={<Lock size={20} />}>Unlock Dashboard</NeuButton>
                  </form>

                  <div className="mt-auto text-center">
                    <button onClick={() => setIsLoginView(false)} className="text-slate-400 text-sm font-bold hover:text-primary transition-colors underline-offset-4 hover:underline flex items-center justify-center gap-2 mx-auto">
                      <UserPlus size={16} /> FIRST TIME? REGISTER AGENCY
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* REGISTER VIEW */
                <motion.div 
                  key="register"
                  initial={{ y: "-100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="p-8 flex flex-col gap-8 h-full"
                >
                  <div className="bg-primary/5 p-4 rounded-3xl text-primary flex items-start gap-4">
                    <AlertCircle size={24} className="mt-1 flex-shrink-0" />
                    <p className="text-sm font-medium leading-normal">
                      Welcome to your personalized billing system. Please set up a security passcode and register your face for instant access.
                    </p>
                  </div>

                  <form onSubmit={handlePasscodeAuth} className="space-y-6">
                    <NeuInput 
                      label="New Security Passcode" 
                      type="password" 
                      value={passcode} 
                      onChange={e=>setPasscode(e.target.value)} 
                      icon={<Key size={18} />}
                      placeholder="Set 4-6 digits"
                    />
                    <NeuButton type="submit" variant="success" className="w-full h-14" icon={<UserPlus size={20} />}>Create Agency Profile</NeuButton>
                  </form>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-slate-400 font-bold tracking-widest">Recommended</span></div>
                  </div>

                  <div className="space-y-6">
                    <div className="aspect-video bg-background rounded-[30px] p-2 shadow-neu-down overflow-hidden">
                      <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full aspect-video rounded-2xl object-cover scale-x-[-1]"
                      />
                    </div>
                    <button 
                      onClick={captureFace}
                      disabled={isScanning || !passcode}
                      className="w-full h-16 bg-background shadow-neu-up border-2 border-primary/20 rounded-2xl flex items-center justify-center gap-3 text-primary font-bold active:shadow-neu-down transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                    >
                      {isScanning ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
                      {isScanning ? 'CAPTURING...' : 'REGISTER FACE ID'}
                    </button>
                  </div>

                  <div className="mt-auto text-center">
                    <button onClick={() => setIsLoginView(true)} className="text-slate-400 text-sm font-bold hover:text-primary transition-colors underline-offset-4 hover:underline flex items-center justify-center gap-2 mx-auto">
                      <ShieldCheck size={16} /> ALREADY REGISTERED? LOGIN
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      
      {/* Footer Info */}
      <div className="mt-8 relative z-20 flex gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <span>Biometric Protected</span>
        <span className="w-1 h-1 bg-slate-300 rounded-full self-center"></span>
        <span>Local Data Only</span>
        <span className="w-1 h-1 bg-slate-300 rounded-full self-center"></span>
        <span>v2.0 Security Core</span>
      </div>
    </div>
  );
};
