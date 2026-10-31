'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pin }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess();
        setPin('');
        setPinError('');
      } else {
        setPinError(data.error || 'Incorrect Password. Please try again.');
      }
    } catch {
      setPinError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Cenonmate Admin CMS</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Full website control, showreels, and leads</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2 block">
              Enter Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-white pr-12 focus:outline-none focus:border-cyan-400 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pinError && <p className="text-red-400 text-xs mt-2">{pinError}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-400 text-black font-bold py-3.5 rounded-xl hover:bg-cyan-300 transition-all text-sm uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-gray-500 hover:text-white transition-colors">
              ← Back to Main Website
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
