import React, { useState } from 'react';
import { type Service, supabase } from '../lib/supabase';
import { Hammer, CheckCircle2, XCircle, DollarSign, Search, Edit3, Save, X } from 'lucide-react';

interface ServicesManagerProps {
  services: Service[];
  onRefresh: () => void;
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({ services, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [typicalPrice, setTypicalPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Toggle active/inactive state of a service
  const handleToggleActive = async (serviceId: string, currentActive: boolean) => {
    setUpdatingId(serviceId);
    try {
      const { error } = await supabase
        .from('services')
        .update({ active: !currentActive })
        .eq('id', serviceId);

      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert(`Database error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Start pricing editing
  const startEditing = (svc: Service) => {
    setEditingId(svc.id);
    setMinPrice(svc.min_price?.toString() || '');
    setTypicalPrice(svc.typical_price?.toString() || '');
    setMaxPrice(svc.max_price?.toString() || '');
  };

  // Save pricing changes
  const savePricing = async (serviceId: string) => {
    setUpdatingId(serviceId);
    try {
      const { error } = await supabase
        .from('services')
        .update({
          min_price: minPrice ? parseFloat(minPrice) : null,
          typical_price: typicalPrice ? parseFloat(typicalPrice) : null,
          max_price: maxPrice ? parseFloat(maxPrice) : null,
        })
        .eq('id', serviceId);

      if (error) throw error;
      setEditingId(null);
      onRefresh();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Search filtering
  const filteredServices = services.filter(svc => 
    svc.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    svc.name_pt?.toLowerCase().includes(search.toLowerCase()) ||
    svc.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-premium rounded-2xl p-6 relative overflow-hidden gold-glow-hover w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-slate-850 pb-4">
        <div className="flex items-center gap-3">
          <Hammer className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-bold text-white font-outfit">Catalog & Pricing Manager</h2>
        </div>
        
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredServices.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500 font-semibold">
            No services found matching search filters.
          </div>
        ) : (
          filteredServices.map((svc) => (
            <div key={svc.id} className="glass rounded-xl p-5 border border-slate-850 hover:border-slate-800 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-950 border border-slate-850 text-slate-400 px-2 py-0.5 rounded">
                      {svc.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2 font-outfit">{svc.name_en}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{svc.name_pt}</p>
                  </div>

                  <button
                    onClick={() => handleToggleActive(svc.id, svc.active)}
                    disabled={updatingId === svc.id}
                    title={svc.active ? 'Disable service in public catalog' : 'Enable service in public catalog'}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      svc.active
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                    }`}
                  >
                    {svc.active ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" /> Hidden
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {svc.desc_en || 'No English description logged.'}
                </p>
              </div>

              {/* Price Manager Section */}
              <div className="mt-5 pt-4 border-t border-slate-850/80">
                {editingId === svc.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Min Price (£)</label>
                        <input
                          type="number"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="e.g. 50"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Typical (£)</label>
                        <input
                          type="number"
                          value={typicalPrice}
                          onChange={(e) => setTypicalPrice(e.target.value)}
                          placeholder="e.g. 120"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Max Price (£)</label>
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="e.g. 300"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 text-xs">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 hover:bg-slate-950 border border-transparent hover:border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 font-semibold"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                      <button
                        onClick={() => savePricing(svc.id)}
                        disabled={updatingId === svc.id}
                        className="px-3 py-1.5 bg-amber-500 text-slate-955 rounded-lg font-bold hover:bg-amber-600 transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Save className="h-3.5 w-3.5" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Estimated Price Range</p>
                      <div className="flex items-center gap-1 text-sm font-semibold text-white mt-1.5">
                        <DollarSign className="h-4 w-4 text-slate-500" />
                        <span>
                          {svc.min_price ? `£${svc.min_price}` : '£--'}
                          <span className="text-slate-500 font-normal mx-1">to</span>
                          {svc.max_price ? `£${svc.max_price}` : '£--'}
                        </span>
                        {svc.typical_price && (
                          <span className="text-xs text-amber-500 font-medium ml-2">
                            (Avg: £{svc.typical_price})
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => startEditing(svc)}
                      className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
