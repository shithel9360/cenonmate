'use client';

import { Mail, Trash2 } from 'lucide-react';
import { InquiryItem } from './types';

interface InquiriesTabProps {
  inquiries: InquiryItem[];
  onRefresh: () => void;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export default function InquiriesTab({ inquiries, onRefresh, onNotify }: InquiriesTabProps) {
  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to remove this client inquiry?')) return;

    try {
      const res = await fetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete inquiry');

      onNotify('success', 'Inquiry removed.');
      onRefresh();
    } catch (err: any) {
      onNotify('error', err.message);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-2">Client Inquiries & Project Briefs ({inquiries.length})</h2>
      <p className="text-gray-400 text-xs mb-6">Messages submitted by potential clients from the website contact form.</p>

      {inquiries.length === 0 && (
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-12 text-center text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold text-gray-400">No client inquiries received yet.</p>
          <p className="text-xs mt-1">When clients fill out the contact form on your website, their messages will appear here.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {inquiries.map((inq) => (
          <div key={inq.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-3 relative group">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base text-white">{inq.name}</h3>
                <a href={`mailto:${inq.email}`} className="text-xs text-cyan-400 hover:underline">
                  {inq.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[0.65rem] text-gray-500">
                  {new Date(inq.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDeleteInquiry(inq.id)}
                  className="text-gray-500 hover:text-red-400 p-1"
                  title="Delete Inquiry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
              {inq.details}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
