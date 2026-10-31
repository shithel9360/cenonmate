'use client';

import { useState } from 'react';
import { Layers, Save } from 'lucide-react';
import { ServiceItem } from './types';

interface ServicesTabProps {
  initialServices: ServiceItem[];
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export default function ServicesTab({ initialServices, onNotify }: ServicesTabProps) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [submitting, setSubmitting] = useState(false);

  const handleSaveServices = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'services_settings', value: services }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save services');

      onNotify('success', 'Services section content updated successfully!');
    } catch (err: any) {
      onNotify('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-10">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        <Layers className="w-5 h-5 text-cyan-400" /> Edit Services & Capabilities
      </h2>
      <p className="text-gray-400 text-xs mb-6">Modify the 3 service highlights shown in the Expertise section.</p>

      <form onSubmit={handleSaveServices} className="space-y-6">
        {services.map((srv, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex gap-4">
              <div className="w-16">
                <label className="text-[0.65rem] text-gray-400 block mb-1">Number</label>
                <input
                  type="text"
                  value={srv.num}
                  onChange={(e) => {
                    const updated = [...services];
                    updated[idx] = { ...updated[idx], num: e.target.value };
                    setServices(updated);
                  }}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-center font-bold"
                />
              </div>
              <div className="flex-1">
                <label className="text-[0.65rem] text-gray-400 block mb-1">Service Title</label>
                <input
                  type="text"
                  value={srv.title}
                  onChange={(e) => {
                    const updated = [...services];
                    updated[idx] = { ...updated[idx], title: e.target.value };
                    setServices(updated);
                  }}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-[0.65rem] text-gray-400 block mb-1">Description</label>
              <textarea
                rows={2}
                value={srv.desc}
                onChange={(e) => {
                  const updated = [...services];
                  updated[idx] = { ...updated[idx], desc: e.target.value };
                  setServices(updated);
                }}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs leading-relaxed resize-none"
              />
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="bg-cyan-400 text-black font-bold px-8 py-3.5 rounded-xl hover:bg-cyan-300 transition-all flex items-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> Save Services
        </button>
      </form>
    </div>
  );
}
