"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 
import { 
  Trash2, Loader2, Calendar, TrendingUp, 
  BarChart2, Search, X, Plus, Activity, Zap, 
  ShieldCheck, ArrowUpRight, Edit3, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{msg: string, type: 'success' | 'error' | 'warn'} | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 1500);
    fetchNotes();
    return () => clearTimeout(timer);
  }, []);

  const formatIndoDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const showAlert = (msg: string, type: 'success' | 'error' | 'warn' = 'success') => {
    setAlertConfig({ msg, type });
    setTimeout(() => setAlertConfig(null), 3000);
  };

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setNotes(data);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      showAlert("Asset & Analisa wajib diisi!", "warn");
      return;
    }
    setIsProcessing(true);
    try {
      const payload = { 
        title: title.toUpperCase(), 
        content, 
        summary: content.substring(0, 60) + (content.length > 60 ? "..." : "") 
      };

      if (editId) {
        const { error } = await supabase.from('notes').update(payload).eq('id', editId);
        if (error) throw error;
        showAlert("Data diperbarui.", "success");
      } else {
        const { error } = await supabase.from('notes').insert([payload]);
        if (error) throw error;
        showAlert("Log tersimpan.", "success");
      }
      cancelEdit();
      fetchNotes();
    } catch (e) {
      showAlert("Gagal memproses data.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (e: React.MouseEvent, note: any) => {
    e.stopPropagation();
    setEditId(note.id);
    setTitle(note.title);
    setContent(note.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setTitle("");
    setContent("");
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Hapus log ini selamanya?")) {
      setIsProcessing(true);
      try {
        const { error } = await supabase.from('notes').delete().eq('id', id);
        if (error) throw error;
        showAlert("Data dihapus.", "success");
        fetchNotes();
      } catch (e) {
        showAlert("Gagal menghapus.", "error");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050708] text-slate-300 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* 1. CUSTOM ALERTS (Floating) */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed left-1/2 top-4 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-2xl shadow-2xl w-[90%] max-w-[320px]"
            style={{ 
              backgroundColor: alertConfig.type === 'success' ? 'rgba(16,185,129,0.2)' : alertConfig.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)' 
            }}
          >
            {alertConfig.type === 'success' && <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />}
            {alertConfig.type === 'error' && <AlertCircle className="text-red-400 shrink-0" size={18} />}
            {alertConfig.type === 'warn' && <Zap className="text-amber-400 shrink-0" size={18} />}
            <p className="text-[10px] font-black uppercase tracking-wider text-white">{alertConfig.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. INITIAL LOADER */}
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-[#050708] flex flex-col items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-2 border-emerald-500/20 border-b-emerald-500 rounded-full" />
            <p className="mt-4 text-[8px] font-black tracking-[0.5em] text-emerald-500 uppercase animate-pulse">Loading Data Backtest...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. CRUD LOADER */}
      <AnimatePresence>
        {isProcessing && (
          <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[#0A0D0E] p-8 rounded-3xl border border-emerald-500/20 flex flex-col items-center">
              <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
              <p className="text-[9px] font-black uppercase tracking-widest">Processing...</p>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-500/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          
          {/* LEFT: FORM (Mobile: First) */}
          <div className="lg:col-span-4 order-1">
            <div className={`p-6 md:p-8 rounded-[32px] border transition-all duration-500 sticky top-10 ${editId ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-[#0A0D0E]/80 border-white/5 backdrop-blur-md'}`}>
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${editId ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-500'}`}>
                    {editId ? <Edit3 size={16} /> : <Zap size={16} fill="currentColor" />}
                  </div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">{editId ? 'Edit Entry' : 'Execute Log'}</h2>
                </div>
                <ShieldCheck className="text-white/10" size={18} />
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-800 mb-2 block">Asset Pair</label>
                  <input 
                    value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.G. XAUUSD"
                    className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-all text-white uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-800 mb-2 block">Strategy Analysis</label>
                  <textarea 
                    value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe setup..."
                    className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-all text-slate-400 h-40 resize-none leading-relaxed"
                  />
                </div>
                <div className="pt-4 space-y-3">
                  <motion.button 
                    whileTap={{ scale: 0.97 }} onClick={handleSave}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all ${editId ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20' : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-emerald-500/20'}`}
                  >
                    {editId ? 'Update Record' : 'Save Record'}
                  </motion.button>
                  {editId && (
                    <button onClick={cancelEdit} className="w-full text-[9px] font-bold text-slate-500 uppercase py-2">Cancel Edit</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: HISTORY (Mobile: Second) */}
          <div className="lg:col-span-8 order-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 px-2">
              <div className="flex items-center gap-4">
                <BarChart2 className="text-emerald-500" size={24} />
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Log History Trade</h2>
              </div>
              <div className="relative group w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900 group-focus-within:text-emerald-500 transition-colors" size={14} />
                <input 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter data..."
                  className="w-full bg-[#0A0D0E] border border-white/5 rounded-full py-3 pl-12 pr-6 text-xs outline-none focus:border-emerald-500/30 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
              <AnimatePresence mode="popLayout">
                {notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).map((note) => (
                  <motion.div 
                    layout key={note.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setSelectedNote(note)}
                    className="group bg-[#0A0D0E]/50 border border-white/5 p-6 md:p-8 rounded-[28px] cursor-pointer hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden active:scale-95 sm:active:scale-100"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-[7px] font-black text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">Data_Secured</div>
                      <div className="flex gap-1">
                        <button onClick={(e) => handleEdit(e, note)} className="p-2 text-slate-600 hover:text-indigo-400"><Edit3 size={16} /></button>
                        <button onClick={(e) => handleDelete(e, note.id)} className="p-2 text-slate-600 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-white mb-2 group-hover:text-emerald-400 transition-colors truncate uppercase italic">{note.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-8">{note.content}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5 text-emerald-900 group-hover:text-emerald-700 transition-colors">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase">
                        <Calendar size={12} /> {formatIndoDate(note.created_at)}
                      </div>
                      <ArrowUpRight size={16} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* 5. MODAL DETAIL (Bottom Sheet Mobile) */}
      <AnimatePresence>
        {selectedNote && !editId && (
          <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedNote(null)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-[#0A0D0E] border-t sm:border border-white/10 rounded-t-[40px] sm:rounded-[48px] p-8 md:p-12 shadow-3xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8 sm:hidden" />
              <button onClick={() => setSelectedNote(null)} className="absolute top-8 right-8 p-2 bg-white/5 rounded-full text-white/50 hover:text-white transition-all"><X size={20} /></button>
              
              <div className="mb-8 shrink-0">
                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                  <Activity size={14} />
                  <span className="text-[9px] font-black tracking-widest uppercase">Journal Entry Detail</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase break-words">{selectedNote.title}</h2>
              </div>

              <div className="bg-black/40 p-6 md:p-8 rounded-[32px] border border-white/5 overflow-y-auto mb-8">
                <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">{selectedNote.content}</p>
              </div>

              <div className="mt-auto flex flex-col sm:flex-row gap-4 justify-between text-[10px] font-black text-emerald-900 uppercase tracking-widest shrink-0">
                <div className="flex items-center gap-2"><Calendar size={14} /> {formatIndoDate(selectedNote.created_at)}</div>
                <div className="flex items-center gap-2"><ShieldCheck size={14} /> System backtest verified</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}