import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const LoginView: React.FC = () => {
  const { login } = useCRM();

  const [email, setEmail] = useState('dev.mdshahalam@gmail.com');
  const [password, setPassword] = useState('Anas@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const success = login(email, password);
      setIsLoading(false);
      if (!success) {
        setErrorMsg('Invalid email or password. Please verify credentials.');
      }
    }, 200);
  };

  const handleFillOwnerCredentials = () => {
    setEmail('dev.mdshahalam@gmail.com');
    setPassword('Anas@2026');
    setErrorMsg('');
  };

  const handleFillLeaderCredentials = () => {
    setEmail('tanvir.leader@alamdigital.com');
    setPassword('Leader@2026');
    setErrorMsg('');
  };

  const handleFillMemberCredentials = () => {
    setEmail('rakib.dev@alamdigital.com');
    setPassword('Rakib@2026');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden font-sans">
      {/* Subtle decorative background gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/30 text-lg">
            DF
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            DevFlow Freelance CRM
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to access your client acquisition & project studio
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Email Address
            </label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                placeholder="dev.mdshahalam@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-9 pr-10 py-2 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to CRM</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Assistant */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Preset Studio Accounts:
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={handleFillOwnerCredentials}
              className="text-left rounded-lg border border-slate-800 bg-slate-800/40 p-2 hover:bg-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="font-semibold text-[11px] text-white">Owner</div>
              <div className="text-[10px] text-purple-400 truncate">dev.mdshahalam...</div>
              <div className="text-[9px] text-slate-500 font-mono">Anas@2026</div>
            </button>

            <button
              type="button"
              onClick={handleFillLeaderCredentials}
              className="text-left rounded-lg border border-slate-800 bg-slate-800/40 p-2 hover:bg-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="font-semibold text-[11px] text-white">Team Leader</div>
              <div className="text-[10px] text-amber-400 truncate">tanvir.leader...</div>
              <div className="text-[9px] text-slate-500 font-mono">Leader@2026</div>
            </button>

            <button
              type="button"
              onClick={handleFillMemberCredentials}
              className="text-left rounded-lg border border-slate-800 bg-slate-800/40 p-2 hover:bg-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="font-semibold text-[11px] text-white">Member</div>
              <div className="text-[10px] text-blue-400 truncate">rakib.dev...</div>
              <div className="text-[9px] text-slate-500 font-mono">Rakib@2026</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
