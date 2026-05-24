import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Sparkles, ShieldAlert, CheckCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMagicLink, setIsMagicLink] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setMessage({
          type: 'success',
          text: '✨ Magic Link sent! Check your inbox to complete authentication.',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLoginSuccess();
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Authentication failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-height-100vh flex items-center justify-center px-4 bg-[#05070f] relative overflow-hidden w-full">
      {/* Background ambient lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="max-w-md w-full glass-premium p-8 rounded-2xl relative z-10 gold-glow-hover">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 mb-4">
            <Sparkles className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-outfit">B.F.O Operations</h1>
          <p className="text-sm text-slate-400">Secure Administrative Dashboard & CRM</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400" />
            )}
            <p className="text-sm leading-relaxed">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="beto@bfopropertymaintenance.co.uk"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
              />
            </div>
          </div>

          {!isMagicLink && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-50 transition-all text-sm cursor-pointer shadow-lg shadow-amber-500/20"
          >
            {loading ? 'Authenticating...' : isMagicLink ? 'Send Magic Sign-In Link' : 'Secure Login'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <button
            onClick={() => {
              setIsMagicLink(!isMagicLink);
              setMessage(null);
            }}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold tracking-wide transition-all uppercase cursor-pointer"
          >
            {isMagicLink ? 'Use secure password sign-in instead' : 'Use magic sign-in link instead'}
          </button>
        </div>
      </div>
    </div>
  );
};
