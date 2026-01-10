"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 
import { 
  Sparkles, Plus, Trash2, Loader2, Calendar, 
  TrendingUp, BarChart2, Zap, Search, Target, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setNotes(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSave = async () => {
    if (!title || !content) return;
    setIsSaving(true);
    const summary = content.length > 80 ? content.substring(0, 80) + "..." : content;
    try {
      await supabase.from('notes').insert([{ title, content, summary }]);
      setTitle(""); setContent("");
      fetchNotes();
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id);
    fetchNotes();
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 selection:bg-emerald-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header Premium */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0E14]/80 backdrop-blur-2xl px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              <TrendingUp size={24} className="text-[#0B0E14]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white leading-none">TRADING<span className="text-emerald-400">LOG</span></h1>
              <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mt-1 uppercase">Smart Analysis AI</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
              <input 
                placeholder="Cari setup..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Market Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-white">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: Input Analysis */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4"
        >
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[32px] backdrop-blur-md sticky top-32 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <Target className="text-emerald-400" size={20} />
              <h2 className="text-lg font-bold text-white">Log Trading Baru</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pair / Saham</label>
                <input 
                  placeholder="BTC/USDT or AAPL..."
                  className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white font-bold"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Analisa Strategi</label>
                <textarea 
                  placeholder="Kenapa kamu entry? (Breakout, RSI, Supply/Demand...)"
                  className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all h-44 resize-none text-slate-300 leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0B0E14] font-black py-4 rounded-2xl flex justify-center items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Simpan Log</>}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Right: Notes History */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart2 className="text-emerald-400" /> Jurnal Histori
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).map((note) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8, borderColor: "rgba(52, 211, 153, 0.3)" }}
                  key={note.id}
                  className="group bg-white/[0.02] border border-white/5 p-7 rounded-[32px] relative flex flex-col h-full hover:bg-white/[0.04] transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(note.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-md">LOGGED</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      {new Date(note.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                    {note.title}
                  </h3>
                  
                  <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow line-clamp-4">
                    {note.content}
                  </p>

                  <div className="mt-auto pt-5 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-2 text-indigo-400">
                      <Zap size={12} className="fill-current" />
                      <span className="text-[10px] font-black uppercase tracking-widest">AI Strategy Summary</span>
                    </div>
                    <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 italic text-xs text-indigo-300 font-medium leading-snug">
                      "{note.summary}"
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}