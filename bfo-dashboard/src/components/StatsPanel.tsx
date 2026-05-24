import React from 'react';
import { type Lead } from '../lib/supabase';
import { Users, Globe, PhoneCall, CheckSquare } from 'lucide-react';

interface StatsPanelProps {
  leads: Lead[];
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ leads }) => {
  const totalLeads = leads.length;
  const pendingLeads = leads.filter(l => l.status === 'new').length;
  const contactedLeads = leads.filter(l => l.status !== 'new' && l.status !== 'lost').length;
  
  // Notified status
  const notifiedLeads = leads.filter(l => l.beto_notified).length;
  const alertCoverage = totalLeads > 0 ? Math.round((notifiedLeads / totalLeads) * 100) : 0;

  // Language split
  const ptLeads = leads.filter(l => l.language === 'pt').length;
  const enLeads = leads.filter(l => l.language === 'en' || !l.language).length;
  const ptPercentage = totalLeads > 0 ? Math.round((ptLeads / totalLeads) * 100) : 0;
  const enPercentage = totalLeads > 0 ? Math.round((enLeads / totalLeads) * 100) : 0;

  // Source split
  const websiteLeads = leads.filter(l => l.source === 'website').length;
  const manualLeads = leads.filter(l => l.source === 'manual' || l.source === 'phone').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Leads Card */}
      <div className="glass-premium p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
          <Users className="h-24 w-24 text-amber-400" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total CRM Leads</p>
            <h3 className="text-3xl font-bold text-white mt-1 font-outfit">{totalLeads}</h3>
          </div>
        </div>
        <div className="flex gap-4 text-xs font-semibold">
          <span className="text-amber-400">{pendingLeads} Pending Review</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">{contactedLeads} In-Progress</span>
        </div>
      </div>

      {/* Alert Coverage Card */}
      <div className="glass-premium p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
          <CheckSquare className="h-24 w-24 text-blue-400" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mobile Alert Coverage</p>
            <h3 className="text-3xl font-bold text-white mt-1 font-outfit">{alertCoverage}%</h3>
          </div>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
            style={{ width: `${alertCoverage}%` }}
          />
        </div>
        <span className="text-xs text-slate-400">{notifiedLeads} of {totalLeads} Beto notified alerts</span>
      </div>

      {/* Bilingual Distribution Card */}
      <div className="glass-premium p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
          <Globe className="h-24 w-24 text-teal-400" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20 text-teal-400">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bilingual Intake</p>
            <h3 className="text-3xl font-bold text-white mt-1 font-outfit">EN {enPercentage}% / PT {ptPercentage}%</h3>
          </div>
        </div>
        <div className="flex w-full rounded-full h-2 mb-2 overflow-hidden bg-slate-950">
          <div className="bg-teal-400 h-full" style={{ width: `${enPercentage}%` }} />
          <div className="bg-amber-400 h-full" style={{ width: `${ptPercentage}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>{enLeads} English Clients</span>
          <span>{ptLeads} Portuguese Clients</span>
        </div>
      </div>

      {/* Intake Sources Card */}
      <div className="glass-premium p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
          <PhoneCall className="h-24 w-24 text-rose-400" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
            <PhoneCall className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Intake Channels</p>
            <h3 className="text-3xl font-bold text-white mt-1 font-outfit">{websiteLeads} / {manualLeads}</h3>
          </div>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 mb-2">
          <div 
            className="bg-rose-500 h-2 rounded-full transition-all duration-1000" 
            style={{ width: `${totalLeads > 0 ? (websiteLeads / totalLeads) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>{websiteLeads} Web Webhooks</span>
          <span>{manualLeads} Phone Intakes</span>
        </div>
      </div>
    </div>
  );
};
