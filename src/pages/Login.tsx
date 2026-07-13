import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { NeuInput } from '../components/ui/NeuInput';
import { NeuButton } from '../components/ui/NeuButton';
import { ShieldCheck, Mail, Key, UserPlus, Lock, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setIsSuccess(true);
      // It will auto-redirect because of the useEffect on isAuthenticated
    } catch (err: any) {
      console.error("Authentication Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Incorrect email or password');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/10 rounded-full blur-[100px] animate-pulse delay-700" />

      <div className="w-full max-w-[450px] relative z-10">
        <motion.div 
          className="bg-background shadow-neu-up rounded-[40px] overflow-hidden min-h-[600px] flex flex-col relative"
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
            <p className="text-slate-500 text-sm font-medium">Cloud Secure Login</p>
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

          {/* Main View */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div 
                key={isLoginView ? 'login' : 'register'}
                initial={{ x: isLoginView ? "-100%" : "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: isLoginView ? "100%" : "-100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="p-8 flex flex-col gap-6 h-full"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                    {isLoginView ? 'Welcome Back' : 'Create Account'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-300 uppercase">
                    {isLoginView ? 'Enter your credentials to access dashboard' : 'Register to secure your agency data'}
                  </p>
                </div>
                
                <div className="relative">
                  <AnimatePresence>
                    {isSuccess && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/90 backdrop-blur-sm rounded-3xl"
                      >
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center text-success shadow-neu-up">
                          <ShieldCheck size={48} />
                        </motion.div>
                        <span className="text-sm font-black uppercase tracking-widest text-success">
                          {isLoginView ? 'Access Granted' : 'Account Created'}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <NeuInput 
                      label="Email Address" 
                      type="email" 
                      value={email} 
                      onChange={e=>setEmail(e.target.value)} 
                      icon={<Mail size={18} />}
                      placeholder="admin@ravimedical.in"
                      required
                    />
                    <NeuInput 
                      label="Password" 
                      type="password" 
                      value={password} 
                      onChange={e=>setPassword(e.target.value)} 
                      icon={<Key size={18} />}
                      placeholder="••••••••"
                      required
                    />
                    <NeuButton 
                      type="submit" 
                      variant="primary" 
                      className="w-full h-14" 
                      icon={isLoginView ? <Lock size={20} /> : <UserPlus size={20} />}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : (isLoginView ? 'Login to Dashboard' : 'Register Account')}
                    </NeuButton>
                  </form>
                </div>

                <div className="mt-auto text-center">
                  <button 
                    onClick={() => {
                      setIsLoginView(!isLoginView);
                      setError('');
                    }} 
                    className="text-slate-400 text-xs font-bold hover:text-primary transition-all flex items-center justify-center gap-2 mx-auto group mt-4"
                  >
                    {isLoginView ? (
                      <><UserPlus size={14} /> FIRST TIME? <span className="underline underline-offset-4 group-hover:no-underline">REGISTER</span></>
                    ) : (
                      <><Lock size={14} /> HAVE ACCOUNT? <span className="underline underline-offset-4 group-hover:no-underline">LOGIN</span></>
                    )}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      
      {/* Footer Info */}
      <div className="mt-8 relative z-20 flex gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <span>Cloud Synced</span>
        <span className="w-1 h-1 bg-slate-300 rounded-full self-center"></span>
        <span>End-to-End Secure</span>
        <span className="w-1 h-1 bg-slate-300 rounded-full self-center"></span>
        <span>Firebase Auth</span>
      </div>
    </div>
  );
};
