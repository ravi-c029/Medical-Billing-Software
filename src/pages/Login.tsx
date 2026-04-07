import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { NeuInput } from '../components/ui/NeuInput';
import { NeuButton } from '../components/ui/NeuButton';
import { PatternLock } from '../components/ui/PatternLock';
import { Lock, UserPlus, Key, ShieldCheck, AlertCircle, Fingerprint, ChevronRight } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { register, login, loginWithPattern, isRegistered, isAuthenticated } = useAuthStore();
  
  const [isLoginView, setIsLoginView] = useState(isRegistered);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPatternError, setIsPatternError] = useState(false);

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

  const handlePatternComplete = (pattern: number[]) => {
    setError('');
    setIsPatternError(false);

    if (isLoginView) {
      if (loginWithPattern(pattern)) {
        setIsSuccess(true);
        setTimeout(() => navigate('/'), 1000);
      } else {
        setIsPatternError(true);
        setError('Unauthorized Pattern Sequence');
      }
    } else {
      if (passcode.length < 4) {
        setError("Set a 4-digit passcode first to secure your pattern");
        setIsPatternError(true);
        return;
      }
      if (pattern.length < 4) {
        setError("Pattern must connect at least 4 nodes");
        setIsPatternError(true);
        return;
      }
      register(passcode, pattern);
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/10 rounded-full blur-[100px] animate-pulse delay-700" />

      <div className="w-full max-w-[500px] relative z-10">
        <motion.div 
          className="bg-background shadow-neu-up rounded-[40px] overflow-hidden min-h-[750px] flex flex-col relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="p-8 text-center pb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl shadow-neu-up flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-primary" size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Ravi Medical Agency</h1>
            <p className="text-slate-500 text-sm font-medium">Neural Pattern Security enabled</p>
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
                /* LOGIN VIEW */
                <motion.div 
                  key="login"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="p-8 flex flex-col gap-6 h-full"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-center space-y-1">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Verify Identity</h3>
                      <p className="text-[10px] font-bold text-slate-300 uppercase">Draw your unique neural sequence</p>
                    </div>
                    
                    <div className="relative">
                      <AnimatePresence>
                        {isSuccess && (
                          <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm rounded-[40px]"
                          >
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center text-success shadow-neu-up">
                              <ShieldCheck size={48} />
                            </motion.div>
                            <span className="text-sm font-black uppercase tracking-widest text-success">Identity Verified</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <PatternLock 
                        onComplete={handlePatternComplete} 
                        isError={isPatternError} 
                        onReset={() => setIsPatternError(false)}
                        size={280}
                      />
                    </div>
                  </div>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-background px-4 text-slate-400 font-bold tracking-widest">OR USE PASSCODE</span></div>
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
                    <NeuButton type="submit" variant="primary" className="w-full h-14" icon={<Lock size={20} />}>Unlock Agency Dashboard</NeuButton>
                  </form>

                  <div className="mt-auto text-center">
                    <button onClick={() => setIsLoginView(false)} className="text-slate-400 text-xs font-bold hover:text-primary transition-all flex items-center justify-center gap-2 mx-auto group">
                      <UserPlus size={14} /> FIRST TIME? <span className="underline underline-offset-4 group-hover:no-underline">REGISTER NEW AGENCY</span>
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
                  className="p-8 flex flex-col gap-6 h-full"
                >
                  <div className="bg-primary/5 p-4 rounded-3xl text-primary flex items-start gap-4">
                    <Fingerprint size={24} className="mt-1 flex-shrink-0" />
                    <p className="text-xs font-bold leading-normal uppercase tracking-wider">
                      Create a unique 4-node pattern to secure your medical data.
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
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       Step 2: Draw Your Pattern <ChevronRight size={12} />
                    </div>
                    
                    <div className="relative py-2">
                       <AnimatePresence>
                        {isSuccess && (
                          <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm rounded-[40px]"
                          >
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center text-success shadow-neu-up">
                              <ShieldCheck size={32} />
                            </motion.div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-success">Pattern Registered</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="flex justify-center">
                        <PatternLock 
                          onComplete={handlePatternComplete}
                          isError={isPatternError}
                          onReset={() => setIsPatternError(false)}
                          size={280}
                        />
                      </div>
                    </div>

                    <NeuButton type="submit" variant="success" className="w-full h-14" icon={<ShieldCheck size={20} />}>Finalise Agency Profile</NeuButton>
                  </form>

                  <div className="mt-auto text-center">
                    <button onClick={() => setIsLoginView(true)} className="text-slate-400 text-xs font-bold hover:text-primary transition-all flex items-center justify-center gap-2 mx-auto group">
                      <Lock size={14} /> ALREADY REGISTERED? <span className="underline underline-offset-4 group-hover:no-underline">LOGIN TO AGENCY</span>
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
        <span>Neural Protected</span>
        <span className="w-1 h-1 bg-slate-300 rounded-full self-center"></span>
        <span>Local Storage</span>
        <span className="w-1 h-1 bg-slate-300 rounded-full self-center"></span>
        <span>v3.0 Security Core</span>
      </div>
    </div>
  );
};
