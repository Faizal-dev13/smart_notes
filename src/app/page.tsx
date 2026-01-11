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
  
  // State untuk Custom Alert
  const [alertConfig, setAlertConfig] = useState<{msg: string, type: 'success' | 'error' | 'warn'} | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 2000);
    fetchNotes();
    return () => clearTimeout(timer);
  }, []);

  // Fungsi Helper Format Tanggal & Zona Waktu (WIB/WITA/WIT)
  const formatIndoDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  };

  const showAlert = (msg: string, type: 'success' | 'error' | 'warn' = 'success') => {
    setAlertConfig({ msg, type });
    setTimeout(() => setAlertConfig(null), 4000);
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
      showAlert("Asset Pair & Analisa wajib diisi!", "warn");
      return;
    }
    
    setIsProcessing(true);
    try {
      const summaryText = content.length > 60 ? content.substring(0, 60) + "..." : content;
      
      if (editId) {
        const { error } = await supabase
          .from('notes')
          .update({ title: title.toUpperCase(), content, summary: summaryText })
          .eq('id', editId);
        if (error) throw error;
        showAlert("Data berhasil diperbarui ke database.", "success");
      } else {
        const { error } = await supabase.from('notes').insert([{ 
          title: title.toUpperCase(), 
          content, 
          summary: summaryText 
        }]);
        if (error) throw error;
        showAlert("Log trading baru berhasil diamankan.", "success");
      }

      cancelEdit();
      fetchNotes();
    } catch (e) {
      showAlert("Gagal terhubung ke database.", "error");
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
    if (confirm("🚨 Hapus log trading ini secara permanen?")) {
      setIsProcessing(true);
      try {
        const { error } = await supabase.from('notes').delete().eq('id', id);
        if (error) throw error;
        showAlert("Data telah dihapus dari arsip.", "success");
        fetchNotes();
      } catch (e) {
        showAlert("Gagal menghapus data.", "error");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050708] text-slate-300 overflow-x-hidden font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* --- NOTIFICATION ALERT (CANTIK) --- */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed left-1/2 z-[1000] flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[320px]"
            style={{ 
              backgroundColor: alertConfig.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : alertConfig.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              borderColor: alertConfig.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : alertConfig.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'
            }}
          >
            {alertConfig.type === 'success' && <CheckCircle2 className="text-emerald-500" size={20} />}
            {alertConfig.type === 'error' && <AlertCircle className="text-red-500" size={20} />}
            {alertConfig.type === 'warn' && <Zap className="text-amber-500" size={20} />}
            <span className="text-xs font-bold uppercase tracking-wider text-white">{alertConfig.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. INITIAL LOADING SCREEN */}
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div 
            key="loader" exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-[#050708] flex flex-col items-center justify-center"
          >
            <div className="relative flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-20 h-20 border-b-2 border-emerald-500 rounded-full"
              />
              <TrendingUp className="absolute text-emerald-500" size={24} />
            </div>
            <p className="mt-8 text-[9px] font-black tracking-[0.6em] text-emerald-600 uppercase animate-pulse">
              Initializing Terminal...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. ACTION LOADING OVERLAY */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] bg-black/60 backdrop-blur-[2px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4 bg-[#0A0D0E] p-10 rounded-[40px] border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
              <Loader2 className="animate-spin text-emerald-500" size={40} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Processing Data...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. ARTISTIC BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#10b98115_0%,transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        <div className="lg:col-span-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className={`transition-colors duration-500 border p-8 rounded-[40px] shadow-2xl sticky top-12 ${
              editId ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-[#0A0D0E] border-emerald-900/20'
            }`}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                {editId ? <Edit3 className="text-indigo-400" size={16} /> : <Zap className="text-emerald-500" size={16} fill="currentColor" />}
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                  {editId ? 'Modify Entry' : 'New Trade Log'}
                </h2>
              </div>
              <ShieldCheck className={editId ? 'text-indigo-900' : 'text-emerald-900'} size={16} />
            </div>

            <div className="space-y-8">
              <div>
                <label className={`text-[9px] font-black uppercase tracking-widest block mb-3 ml-1 ${editId ? 'text-indigo-500' : 'text-emerald-800'}`}>Asset / Pair</label>
                <input 
                  placeholder="E.G. XAU/USD"
                  className="w-full bg-[#050708] border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold text-white uppercase"
                  value={title} onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className={`text-[9px] font-black uppercase tracking-widest block mb-3 ml-1 ${editId ? 'text-indigo-500' : 'text-emerald-800'}`}>Strategy Analysis</label>
                <textarea 
                  placeholder="Describe your setup..."
                  className="w-full bg-[#050708] border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all h-52 resize-none text-slate-400 text-sm leading-relaxed"
                  value={content} onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <motion.button 
                  whileTap={{ scale: 0.98 }} onClick={handleSave}
                  className={`w-full font-black py-5 rounded-3xl flex items-center justify-center gap-3 transition-all shadow-xl uppercase text-[10px] tracking-[0.2em] ${
                    editId ? 'bg-indigo-600 text-white shadow-indigo-500/10' : 'bg-emerald-600 text-[#050708] shadow-emerald-500/10'
                  }`}
                >
                  {editId ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                  {editId ? 'Update Record' : 'Execute Record'}
                </motion.button>
                {editId && (
                  <button onClick={cancelEdit} className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors py-2">
                    Cancel Operation
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <BarChart2 className="text-emerald-500" size={20} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Journal History</h2>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900" size={14} />
              <input 
                placeholder="Filter journals..."
                className="bg-[#0A0D0E] border border-white/5 rounded-full pl-12 pr-6 py-3 text-xs outline-none focus:border-emerald-500/30 w-full md:w-72 transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).map((note) => (
                <motion.div 
                  layout key={note.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8, borderColor: "rgba(16,185,129,0.3)", backgroundColor: "rgba(16,185,129,0.02)" }}
                  onClick={() => setSelectedNote(note)}
                  className="bg-[#0A0D0E] border border-white/5 p-8 rounded-[35px] cursor-pointer group transition-all duration-300 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-[8px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                      Archive_ID
                    </div>
                    <div className="flex gap-2">
                      <button onClick={(e) => handleEdit(e, note)} className="p-2 text-slate-700 hover:text-indigo-400 transition-colors"><Edit3 size={16} /></button>
                      <button onClick={(e) => handleDelete(e, note.id)} className="p-2 text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors tracking-tight uppercase italic truncate">{note.title}</h3>
                  <p className="text-[11px] text-slate-600 font-medium line-clamp-2 leading-relaxed mb-8">{note.content}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-900 group-hover:text-emerald-600 uppercase tracking-widest transition-colors">
                      <Calendar size={12} /> {formatIndoDate(note.created_at)}
                    </div>
                    <ArrowUpRight size={16} className="text-emerald-950 group-hover:text-emerald-500 transition-all" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* MODAL: DETAIL */}
      <AnimatePresence>
        {selectedNote && !editId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl bg-[#0A0D0E] border border-emerald-500/20 rounded-[50px] p-12 shadow-3xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
              <button onClick={() => setSelectedNote(null)} className="absolute top-10 right-10 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"><X size={20} /></button>
              <div className="mb-12">
                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                  <Activity size={14} />
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-600">Audit_Log_Detailed</span>
                </div>
                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">{selectedNote.title}</h2>
              </div>
              <div className="bg-[#050708] p-10 rounded-[40px] border border-white/5 overflow-y-auto max-h-[40vh]">
                <p className="text-slate-300 leading-relaxed text-lg font-medium whitespace-pre-wrap">{selectedNote.content}</p>
              </div>
              <div className="mt-10 flex items-center justify-between text-[10px] font-black text-emerald-900 uppercase tracking-widest">
                <div className="flex items-center gap-3">
                  <Calendar size={14} />
                  {formatIndoDate(selectedNote.created_at)}
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" /> SECURE_V4_TERMINAL
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}