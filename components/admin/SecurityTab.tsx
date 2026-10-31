'use client';

import { useState } from 'react';
import { Key } from 'lucide-react';

interface SecurityTabProps {
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export default function SecurityTab({ onNotify }: SecurityTabProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      onNotify('error', 'Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      onNotify('error', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      onNotify('error', 'Passwords do not match!');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      onNotify('success', 'Admin Password successfully changed! Redirecting to login...');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      onNotify('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-10">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        <Key className="w-5 h-5 text-cyan-400" /> Change Admin Password
      </h2>
      <p className="text-gray-400 text-xs mb-6">
        You can change your admin dashboard password anytime right from here without touching any code.
      </p>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1 font-semibold">Current Password</label>
          <input
            type="password"
            required
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1 font-semibold">New Password</label>
          <input
            type="password"
            required
            placeholder="Enter at least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1 font-semibold">Confirm New Password</label>
          <input
            type="password"
            required
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-cyan-400 text-black font-bold py-3.5 rounded-xl hover:bg-cyan-300 transition-all text-xs uppercase tracking-wider disabled:opacity-50"
        >
          {submitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
