import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PlusCircle, User, Phone, Mail, MapPin, Globe, Hammer, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NewLeadFormProps {
  onSuccess: () => void;
  services: Array<{ slug: string; name_en: string; name_pt: string }>;
}

export const NewLeadForm: React.FC<NewLeadFormProps> = ({ onSuccess, services }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [town, setTown] = useState('');
  const [postcode, setPostcode] = useState('');
  const [language, setLanguage] = useState('en');
  const [serviceRaw, setServiceRaw] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageBanner, setMessageBanner] = useState<{ text: string; success: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessageBanner(null);

    const leadData = {
      name,
      phone: phone || null,
      email: email || null,
      town: town || null,
      postcode: postcode || null,
      language,
      service_raw: serviceRaw || 'General Maintenance',
      message: message || null,
      source: 'phone',
      status: 'new',
      beto_notified: false
    };

    try {
      // 1. Insert into Supabase Leads
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();

      if (error) throw error;

      // 2. Proactively trigger n8n Webhook so client receives automated WhatsApp secretary and Welcome Email!
      const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://89.116.229.213:5678/webhook/bfo-website-lead';
      
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            phone,
            email,
            service: serviceRaw,
            message,
            language,
            source: 'phone-intake'
          }),
        });

        // Mark Beto notified on successful delivery
        await supabase
          .from('leads')
          .update({ beto_notified: true })
          .eq('id', data.id);
      } catch (webhookErr) {
        console.warn('Webhook auto-fire skipped/failed:', webhookErr);
      }

      setMessageBanner({
        text: '🎉 Lead logged successfully! Supabase CRM row created and welcome auto-alerts queued.',
        success: true
      });

      // Clear form
      setName('');
      setPhone('');
      setEmail('');
      setTown('');
      setPostcode('');
      setServiceRaw('');
      setMessage('');
      
      onSuccess();
    } catch (err: any) {
      setMessageBanner({
        text: `❌ Intake failed: ${err.message || 'Check database connection'}`,
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-premium rounded-2xl p-6 relative overflow-hidden gold-glow-hover w-full">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-850 pb-4">
        <PlusCircle className="h-6 w-6 text-amber-500" />
        <h2 className="text-xl font-bold text-white font-outfit">Phone Call & Walk-in Intake</h2>
      </div>

      {messageBanner && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${
          messageBanner.success 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
        }`}>
          {messageBanner.success ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          )}
          <p className="text-xs leading-relaxed">{messageBanner.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Name Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Customer Name <span className="text-amber-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Phone Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44 7123 456789"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Service Type Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Service Requested <span className="text-amber-500">*</span>
          </label>
          <div className="relative">
            <Hammer className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <select
              required
              value={serviceRaw}
              onChange={(e) => setServiceRaw(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm cursor-pointer pr-10 appearance-none"
            >
              <option value="">Select service from catalog...</option>
              {services.map((svc) => (
                <option key={svc.slug} value={svc.name_en}>
                  {svc.name_en} | {svc.name_pt}
                </option>
              ))}
              <option value="Custom General Maintenance">Custom Maintenance / Other</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-400 h-0 w-0" />
          </div>
        </div>

        {/* Location / Town */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            City / Town
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={town}
              onChange={(e) => setTown(e.target.value)}
              placeholder="Ely"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Postal Code / Area
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="CB7 4EE"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Language Preference */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Bilingual Preference
          </label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm cursor-pointer pr-10 appearance-none"
            >
              <option value="en">English (EN)</option>
              <option value="pt">Portuguese (PT)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-400 h-0 w-0" />
          </div>
        </div>

        {/* Padding placeholder to keep layout symmetrical on larger viewports */}
        <div className="hidden md:block" />

        {/* Message / Job Notes */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Detailed Message / Job Notes
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide specific notes about the customer request..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 text-right">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-955 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-50 transition-all text-sm cursor-pointer shadow-lg shadow-amber-500/10"
          >
            {loading ? 'Creating CRM Record...' : 'Log & Queue Automated Welcome alerts'}
          </button>
        </div>
      </form>
    </div>
  );
};
