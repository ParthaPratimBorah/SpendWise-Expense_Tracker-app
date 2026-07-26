import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Coins, ArrowRight, Phone, Key, Mail, ArrowLeft, User, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { user, loginWithGoogle, sendOtp, confirmOtp, loginWithEmail, registerWithEmail, loading } = useAuth();
  const navigate = useNavigate();

  // Tabs and Forms State
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [emailMode, setEmailMode] = useState<'login' | 'register'>('login');
  
  // Email Creds
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Phone Creds & Steps
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  // Status & UI State
  const [errorOnAuth, setErrorOnAuth] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check if we are inside an iframe since standard browsers block Firebase pops inside iframes
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const getReadableAuthError = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes('auth/unauthorized-domain') || lower.includes('unauthorized domain')) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'your deployed site domain';
      return `Domain Mismatch: This domain "${origin}" is not yet an authorized domain in your Firebase project. Please go to your Firebase Console > Authentication > Settings > Authorized Domains, and add "${origin}" to the list.`;
    }
    if (lower.includes('auth/popup-blocked') || lower.includes('popup-closed-by-user') || lower.includes('popup blocked') || lower.includes('cancelled-popup-request') || lower.includes('cancelled-popup')) {
      return 'Google Sign-In popup was closed, blocked, or cancelled. If your browser blocks popups, please click the "Open App in New Tab" button below to sign in successfully, or use the Email or Phone authentication options.';
    }
    if (lower.includes('auth/operation-not-allowed')) {
      return 'Google Sign-In is not enabled inside your Firebase console. Please navigate to Authentication > Sign-in method and enable the Google provider.';
    }
    if (lower.includes('too_short') || lower.includes('invalid-phone-number') || lower.includes('invalid phone number') || lower.includes('too short')) {
      return 'The phone number entered is invalid or too short. Please include a complete country code and valid digits (e.g., +12065550100 or +919876543210).';
    }
    if (lower.includes('auth/quota-exceeded')) {
      return 'SMS daily transmission limit exceeded for this Firebase project. Please retry later or use Google/Email options.';
    }
    if (lower.includes('auth/captcha-check-failed') || lower.includes('recaptcha')) {
      return 'reCAPTCHA security verification failed. Please try again or open the app in a new tab if you are using an iframe.';
    }
    if (lower.includes('auth/invalid-verification-code') || lower.includes('invalid-credential')) {
      return 'The security code you entered is invalid. Please double check the 6-digit code or try requesting a new one.';
    }
    return message;
  };

  const handleGoogleLogin = async () => {
    try {
      setErrorOnAuth(null);
      setIsSubmitting(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Google Auth Failed:', error);
      const rawErrorMsg = error.message || String(error);
      setErrorOnAuth(getReadableAuthError(rawErrorMsg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorOnAuth('Please enter both email and password.');
      return;
    }

    try {
      setErrorOnAuth(null);
      setIsSubmitting(true);
      setSuccessMsg('Verifying credentials...');
      await loginWithEmail(cleanEmail, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Email log in failed:', err);
      setErrorOnAuth(err.message || 'Invalid email address or incorrect password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanName = displayName.trim();
    if (!cleanEmail || !password || !cleanName) {
      setErrorOnAuth('All fields are required to create an account.');
      return;
    }

    if (password.length < 6) {
      setErrorOnAuth('Password length must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorOnAuth('Passwords matching failed. Ensure passwords match.');
      return;
    }

    try {
      setErrorOnAuth(null);
      setIsSubmitting(true);
      setSuccessMsg('Registering your secure account...');
      await registerWithEmail(cleanEmail, password, cleanName);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Email registration failed:', err);
      setErrorOnAuth(err.message || 'Failed to create account. Email may be invalid or already in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPhone = phoneNumber.trim();
    if (!formattedPhone) {
      setErrorOnAuth('Please enter a valid phone number');
      return;
    }

    if (!formattedPhone.startsWith('+')) {
      setErrorOnAuth('Secure SMS authentication requires a starting country code (e.g., +919876543210 or +1234567890).');
      return;
    }

    // Must have at least 7 digits after the '+' sign for E.164 phone formats
    const digitsCount = formattedPhone.substring(1).replace(/[^\d]/g, '').length;
    if (digitsCount < 7) {
      setErrorOnAuth('The phone number entered is too short. Please include a complete country code and valid digits (e.g., +12065550100).');
      return;
    }

    try {
      setErrorOnAuth(null);
      setIsSubmitting(true);
      setSuccessMsg('Verifying security details...');

      // Send OTP (uses invisible recaptcha container)
      await sendOtp(formattedPhone, 'recaptcha-container');
      
      setStep('otp');
      setSuccessMsg(`Verification code sent to ${formattedPhone}`);
    } catch (err: any) {
      console.error('Failed to send OTP:', err);
      const rawErrorMsg = err.message || String(err);
      setErrorOnAuth(getReadableAuthError(rawErrorMsg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = verificationCode.trim();
    if (!trimmedCode) {
      setErrorOnAuth('Please enter the verification code');
      return;
    }

    try {
      setErrorOnAuth(null);
      setIsSubmitting(true);
      setSuccessMsg('Verifying security code...');

      await confirmOtp(trimmedCode);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Failed to verify OTP:', err);
      const rawErrorMsg = err.message || String(err);
      setErrorOnAuth(getReadableAuthError(rawErrorMsg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep('phone');
    setVerificationCode('');
    setErrorOnAuth(null);
    setSuccessMsg(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbf9] flex flex-col items-center justify-center font-black uppercase text-sm select-none gap-3 tracking-widest text-black">
        <div className="animate-spin h-6 w-6 border-4 border-black border-t-transparent rounded-none" />
        LOADING SECURE SESSION...
      </div>
    );
  }

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fbfbf9] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-6 animate-in fade-in zoom-in duration-300">
        
        {/* App Logo */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 border-4 border-black bg-yellow-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <Coins size={48} strokeWidth={3} className="text-black" />
          </div>

          <div className="space-y-2">
            <h1 className="font-extrabold text-4xl md:text-5xl uppercase tracking-tighter text-black border-b-4 border-black pb-3">
              EXPENSE VAULT
            </h1>
            <p className="font-black text-xs uppercase tracking-widest text-gray-500">
              SIMPLE EXPENSE & BUDGET TRACKER
            </p>
          </div>
        </div>

        {/* Auth Panel Grid */}
        <div className="card-brutal bg-white p-6 md:p-8 space-y-6">
          
          {/* Tabs Selector */}
          <div className="grid grid-cols-2 border-4 border-black bg-white select-none font-black text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('email');
                setErrorOnAuth(null);
                setSuccessMsg(null);
              }}
              className={`py-3 text-center uppercase tracking-wider cursor-pointer border-r-4 border-black transition-all ${
                activeTab === 'email' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-500 hover:bg-neutral-50'
              }`}
            >
              Email Secure Auth
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('phone');
                setErrorOnAuth(null);
                setSuccessMsg(null);
              }}
              className={`py-3 text-center uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === 'phone' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-500 hover:bg-neutral-50'
              }`}
            >
              Phone OTP Auth
            </button>
          </div>

          {errorOnAuth && (
            <div className="p-3.5 bg-red-100 border-2 border-black font-extrabold text-xs uppercase text-red-600 tracking-tight leading-relaxed">
              ⚠️ {errorOnAuth}
            </div>
          )}

          {successMsg && !errorOnAuth && (
            <div className="p-3.5 bg-green-100 border-2 border-black font-extrabold text-xs uppercase text-green-700 tracking-tight leading-relaxed">
              ✅ {successMsg}
            </div>
          )}

          {/* Email Tab Section */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              {emailMode === 'login' ? (
                /* Login Form */
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="border-b-2 border-black pb-2">
                    <h2 className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
                      <Lock size={14} strokeWidth={3} /> SIGN IN TO YOUR VAULT
                    </h2>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={isSubmitting}
                      className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:bg-yellow-50 focus:shadow-brutal-sm transition-all text-sm uppercase tracking-tight"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                      Secure Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isSubmitting}
                      className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:bg-yellow-50 focus:shadow-brutal-sm transition-all text-sm uppercase tracking-tight"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-brutal border-4 bg-green-300 hover:bg-green-400 text-xs font-black uppercase py-3 cursor-pointer select-none disabled:opacity-50"
                  >
                    {isSubmitting ? 'PROCESSING...' : 'SECURE SIGN IN'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailMode('register');
                        setErrorOnAuth(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[10px] font-black uppercase tracking-wide text-gray-400 hover:text-black hover:underline"
                    >
                      Don't have an Account? Create Account &gt;&gt;
                    </button>
                  </div>
                </form>
              ) : (
                /* Registration Form - Create Account */
                <form onSubmit={handleEmailRegister} className="space-y-4">
                  <div className="border-b-2 border-black pb-2">
                    <h2 className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
                      <User size={14} strokeWidth={3} /> CREATE NEW SECURE ACCOUNT
                    </h2>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                      Full Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Partha Borah"
                      required
                      disabled={isSubmitting}
                      className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:bg-yellow-50 focus:shadow-brutal-sm transition-all text-sm uppercase tracking-tight"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={isSubmitting}
                      className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:bg-yellow-50 focus:shadow-brutal-sm transition-all text-sm uppercase tracking-tight"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                      Secure Password (6+ chars)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      disabled={isSubmitting}
                      className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:bg-yellow-50 focus:shadow-brutal-sm transition-all text-sm uppercase tracking-tight"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      disabled={isSubmitting}
                      className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:bg-yellow-50 focus:shadow-brutal-sm transition-all text-sm uppercase tracking-tight"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-brutal border-4 bg-green-300 hover:bg-green-400 text-xs font-black uppercase py-3 cursor-pointer select-none disabled:opacity-50"
                  >
                    {isSubmitting ? 'PROCESSING...' : 'REGISTER & OPEN VAULT'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailMode('login');
                        setErrorOnAuth(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[10px] font-black uppercase tracking-wide text-gray-400 hover:text-black hover:underline"
                    >
                      Already have an Account? Log In &gt;&gt;
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Phone OTP Tab Section */}
          {activeTab === 'phone' && (
            <div className="space-y-4">
              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="border-b-2 border-black pb-2">
                    <h2 className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
                      <Phone size={14} strokeWidth={3} /> PHONE NUMBER PASSWORDLESS SIGN-IN
                    </h2>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 flex items-center justify-center font-black text-xs text-gray-400">
                        +
                      </span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.startsWith('+')) {
                            val = val.substring(1);
                          }
                          setPhoneNumber('+' + val.replace(/[^\d]/g, ''));
                        }}
                        placeholder="12065550100 (include country code)"
                        required
                        disabled={isSubmitting}
                        className="w-full bg-white border-2 border-black p-3 pl-7 font-bold text-black focus:outline-none focus:bg-yellow-50 focus:shadow-brutal-sm transition-all text-sm uppercase tracking-tight"
                      />
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">
                      Include international code without special characters (e.g. +91XXXXXXXXXX or +1XXXXXXXXXX).
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-brutal border-4 bg-green-300 hover:bg-green-400 text-xs font-black uppercase py-3 cursor-pointer select-none disabled:opacity-50"
                  >
                    {isSubmitting ? 'PROCESSING...' : 'SEND VERIFICATION CODE'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="border-b-2 border-black pb-2 flex justify-between items-center">
                    <h2 className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
                      <Key size={14} strokeWidth={3} /> ENTER SECURITY CODE
                    </h2>
                    <button
                      type="button"
                      onClick={resetFlow}
                      className="font-black text-[9px] uppercase tracking-wider text-gray-500 hover:text-black flex items-center gap-1"
                    >
                      <ArrowLeft size={10} strokeWidth={3} /> Change Number
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                      Verification Code (OTP)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^\d]/g, ''))}
                      placeholder="Insert 6-digit code"
                      required
                      disabled={isSubmitting}
                      className="w-full bg-white border-2 border-black p-3 font-mono font-black text-center text-black focus:outline-none focus:bg-yellow-50 focus:shadow-brutal-sm transition-all text-lg tracking-[0.5em]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-brutal border-4 bg-green-300 hover:bg-green-400 text-xs font-black uppercase py-3 cursor-pointer select-none disabled:opacity-50"
                  >
                    {isSubmitting ? 'VERIFYING...' : 'VERIFY OTP & LOG IN'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Recaptcha element container bound by Firebase */}
          <div id="recaptcha-container"></div>

          {/* Google Sign-In Block */}
          <div className="pt-4 border-t-2 border-dashed border-black space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full btn-brutal border-4 bg-yellow-400 hover:bg-yellow-500 text-xs font-black uppercase py-3 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Mail size={14} strokeWidth={3} />
              SIGN IN WITH GOOGLE
              <ArrowRight size={14} strokeWidth={3} />
            </button>

            {isInIframe && (
              <div className="p-3 bg-amber-50 border-2 border-black text-[11px] font-bold text-amber-900 uppercase tracking-wide leading-relaxed shadow-brutal-sm">
                <p className="font-black text-amber-950 flex items-center gap-1.5 mb-1.5">
                  ⚠️ Google Sign-In container guide
                </p>
                Browsers often enforce strict cookie contexts and block popups inside embedded frame environments. If Google Sign-In is blocked, please click below to open the application in a standalone tab:
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="mt-2.5 w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-black text-[10px] font-black uppercase tracking-wider shadow-brutal-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open App in New Tab</span>
                  <ArrowRight size={12} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
