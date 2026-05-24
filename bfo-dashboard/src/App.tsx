import { useState, useEffect } from 'react';
import { supabase, type Lead, type Service } from './lib/supabase';
import { Login } from './components/Login';
import { StatsPanel } from './components/StatsPanel';
import { LeadsTable } from './components/LeadsTable';
import { NewLeadForm } from './components/NewLeadForm';
import { ServicesManager } from './components/ServicesManager';
import { LogOut, RefreshCw, Layers, PlusCircle, Hammer, Shield, Clock } from 'lucide-react';

function App() {
  const [session, setSession] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'leads' | 'intake' | 'services'>('leads');
  const [loading, setLoading] = useState(false);

  // 1. Session Listener Setup
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Data Callback
  const fetchData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      // Fetch Leads (public.leads)
      const { data: leadsData, error: leadsErr } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsErr) throw leadsErr;
      setLeads(leadsData || []);

      // Fetch Services (public.services)
      const { data: servicesData, error: servicesErr } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });

      if (servicesErr) throw servicesErr;
      setServices(servicesData || []);
    } catch (err: any) {
      console.error('[BFO Dashboard] Data fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch data on session change or load
  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Login onLoginSuccess={() => fetchData()} />;
  }

  return (
    <div className="min-h-screen bg-[#070b16] pb-12 text-slate-100 flex flex-col font-sans relative">
      {/* Background radial gradient sweeps */}
      <div className="absolute top-0 left-1/4 w-[1000px] h-[300px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[1000px] h-[300px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      {/* Main Premium Navbar */}
      <header className="glass border-b border-slate-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center border border-amber-400/40 shadow-lg shadow-amber-500/10">
              <Shield className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-outfit leading-none mb-1">B.F.O Property Maintenance</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-amber-500">Secure Operations Control</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            {/* GMT / Local Time counter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 px-3.5 py-2 rounded-xl text-slate-400 font-mono">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Ely, UK: {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 hover:text-rose-300 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Body */}
      <main className="max-w-7xl mx-auto px-6 mt-8 w-full flex-grow">
        {/* Statistics Panels */}
        <StatsPanel leads={leads} />

        {/* Navigation Tabs */}
        <div className="flex justify-between items-center gap-4 mb-8 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-900">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <Layers className="h-4 w-4" />
              Leads Pipeline
            </button>
            <button
              onClick={() => setActiveTab('intake')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'intake'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              Phone Call Intake
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <Hammer className="h-4 w-4" />
              Catalog Pricing
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh CRM Data
          </button>
        </div>

        {/* Tab View Routing */}
        <div className="w-full">
          {activeTab === 'leads' && (
            <LeadsTable leads={leads} onRefresh={fetchData} />
          )}

          {activeTab === 'intake' && (
            <NewLeadForm 
              onSuccess={fetchData} 
              services={services.map(s => ({ slug: s.slug, name_en: s.name_en, name_pt: s.name_pt }))} 
            />
          )}

          {activeTab === 'services' && (
            <ServicesManager services={services} onRefresh={fetchData} />
          )}
        </div>
      </main>

      {/* Footer Audit Signature */}
      <footer className="mt-16 text-center text-xs text-slate-550 max-w-7xl mx-auto px-6 border-t border-slate-950 pt-6">
        <p>© 2026 B.F.O Property Maintenance. Secured with Supabase Identity Management and synced to n8n Automation Engine.</p>
      </footer>
    </div>
  );
}

export default App;
