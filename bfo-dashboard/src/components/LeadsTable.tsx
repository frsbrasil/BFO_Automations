import React, { useState } from 'react';
import { type Lead, supabase } from '../lib/supabase';
import { Search, Filter, RefreshCw, CheckCircle2, AlertCircle, Trash2, Mail, Phone, Calendar } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  onRefresh: () => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [notifiedFilter, setNotifiedFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<{ id: string; text: string; success: boolean } | null>(null);

  // Status updating callback
  const handleToggleNotified = async (leadId: string, currentState: boolean) => {
    setUpdatingId(leadId);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ beto_notified: !currentState })
        .eq('id', leadId);

      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert(`Database error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Status badge update callback
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingId(leadId);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert(`Database error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Re-trigger n8n Webhook manually
  const handleReTriggerWebhook = async (lead: Lead) => {
    setTriggeringId(lead.id);
    setNotificationMsg(null);
    try {
      // Hits the self-hosted n8n active webhook catcher
      const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://89.116.229.213:5678/webhook/bfo-website-lead';
      
      const payload = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        service: lead.service_raw,
        message: lead.message,
        language: lead.language || 'en',
        source: lead.source || 'manual-retrigger'
      };

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      
      // Auto-update db to notify state on successful trigger
      await supabase
        .from('leads')
        .update({ beto_notified: true })
        .eq('id', lead.id);

      setNotificationMsg({
        id: lead.id,
        text: '🚀 Webhook successfully re-triggered! WhatsApp/Email logs created.',
        success: true
      });
      
      onRefresh();
    } catch (err: any) {
      setNotificationMsg({
        id: lead.id,
        text: `❌ Webhook delivery failed: ${err.message || 'Check network / server status'}`,
        success: false
      });
    } finally {
      setTriggeringId(null);
    }
  };

  // Delete lead callback
  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('⚠️ Are you sure you want to permanently delete this lead from Supabase?')) return;
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Filtering matching items
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(search.toLowerCase()) ||
      lead.service_raw?.toLowerCase().includes(search.toLowerCase()) ||
      lead.message?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesLanguage = languageFilter === 'all' || lead.language === languageFilter;
    
    const matchesNotified = 
      notifiedFilter === 'all' || 
      (notifiedFilter === 'yes' && lead.beto_notified) ||
      (notifiedFilter === 'no' && !lead.beto_notified);

    return matchesSearch && matchesStatus && matchesLanguage && matchesNotified;
  });

  return (
    <div className="glass-premium rounded-2xl p-6 relative overflow-hidden gold-glow-hover w-full">
      {/* Table Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads by name, email, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer pr-4"
            >
              <option value="all">All Statuses</option>
              <option value="new">New Leads</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="completed">Completed</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <GlobeFilterIcon />
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer pr-4"
            >
              <option value="all">All Languages</option>
              <option value="en">English (EN)</option>
              <option value="pt">Portuguese (PT)</option>
            </select>
          </div>

          {/* Notified Filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <BellFilterIcon />
            <select
              value={notifiedFilter}
              onChange={(e) => setNotifiedFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer pr-4"
            >
              <option value="all">All Alert States</option>
              <option value="yes">Beto Notified</option>
              <option value="no">Not Notified</option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Leads Table Render */}
      <div className="overflow-x-auto w-full rounded-xl border border-slate-850">
        <table className="min-w-full divide-y divide-slate-850 text-left">
          <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-4">Lead Intake</th>
              <th className="px-6 py-4">Client Contact</th>
              <th className="px-6 py-4">Service Requested</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Beto Notified</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 bg-slate-900/30 text-sm">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500 font-semibold">
                  No leads matching search or active filter bounds.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-950/40 transition-colors group">
                  {/* Lead Intake Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-950 rounded-lg text-slate-500 border border-slate-850">
                        <Calendar className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {new Date(lead.created_at).toLocaleDateString(undefined, { 
                            month: 'short', day: 'numeric', year: 'numeric' 
                          })}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="capitalize">{lead.source}</span>
                          <span>•</span>
                          <span className="uppercase text-[10px] font-bold px-1.5 py-0.25 bg-slate-950 border border-slate-850 text-slate-400 rounded">
                            {lead.language || 'en'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Client Contact Info */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-white">{lead.name}</div>
                      <div className="text-xs text-slate-400 flex flex-col gap-0.5 mt-1 font-mono">
                        {lead.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-slate-500" /> {lead.email}
                          </span>
                        )}
                        {lead.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-slate-500" /> {lead.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Service info */}
                  <td className="px-6 py-4">
                    <div className="max-w-[200px]">
                      <div className="font-semibold text-amber-400 truncate">{lead.service_raw || 'General Repair'}</div>
                      <div className="text-xs text-slate-500 truncate mt-1 italic">
                        "{lead.message || 'No description provided.'}"
                      </div>
                    </div>
                  </td>

                  {/* Lead Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      disabled={updatingId === lead.id}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border focus:outline-none cursor-pointer capitalize ${
                        lead.status === 'new' 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                          : lead.status === 'contacted'
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          : lead.status === 'quoted'
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                          : lead.status === 'completed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="quoted">Quoted</option>
                      <option value="completed">Completed</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>

                  {/* Notified Switch */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleNotified(lead.id, lead.beto_notified)}
                      disabled={updatingId === lead.id}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                        lead.beto_notified
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}
                    >
                      {lead.beto_notified ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Notified
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5" /> Pending
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                    <div className="flex items-center justify-end gap-2">
                      {/* Re-trigger Webhook */}
                      <button
                        onClick={() => handleReTriggerWebhook(lead)}
                        disabled={triggeringId === lead.id}
                        title="Re-trigger n8n automation webhook"
                        className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw className={`h-3 w-3 ${triggeringId === lead.id ? 'animate-spin' : ''}`} />
                        Trigger
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        title="Delete Lead permanently"
                        className="p-1.5 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inner Notification Message */}
      {notificationMsg && (
        <div className={`mt-6 p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
          notificationMsg.success
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {notificationMsg.success ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-rose-400" />}
            <span>{notificationMsg.text}</span>
          </div>
          <button 
            onClick={() => setNotificationMsg(null)}
            className="text-slate-400 hover:text-white transition-all uppercase text-[10px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

const GlobeFilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-500"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);

const BellFilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-500"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
);
