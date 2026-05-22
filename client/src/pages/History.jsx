import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { 
  History as HistoryIcon,
  Search,
  Calendar,
  Clock,
  ShieldCheck,
  Brain,
  ChevronRight,
  Trash2,
  X,
  Copy,
  Check,
  FileDown,
  MessageSquare,
  Send,
  Loader2,
  RefreshCw,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function HistoryPage() {
  const { API_URL } = useAuth();

  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail Modal states
  const [selectedSummary, setSelectedSummary] = useState(null); // Full Summary Record
  const [detailLoading, setDetailLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Chat context inside Modal states
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/history`);
      if (res.data.success) {
        setSummaries(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching summaries history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (id) => {
    try {
      setDetailLoading(true);
      setSelectedSummary(null);
      setChatHistory([]);
      
      const res = await axios.get(`${API_URL}/history/${id}`);
      if (res.data.success) {
        const record = res.data.data;
        setSelectedSummary(record);
        setChatHistory(record.chatHistory || []);
        
        // Auto scroll chat
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
      }
    } catch (err) {
      console.error('Error fetching summary details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Stop trigger open details
    if (!window.confirm('Are you sure you want to permanently delete this summary from your history log?')) return;
    
    try {
      const res = await axios.delete(`${API_URL}/history/${id}`);
      if (res.data.success) {
        setSummaries(prev => prev.filter(s => s._id !== id));
        if (selectedSummary?._id === id) {
          setSelectedSummary(null);
        }
      }
    } catch (err) {
      console.error('Error deleting summary:', err);
    }
  };

  // Copy helper
  const handleCopy = () => {
    if (!selectedSummary) return;
    navigator.clipboard.writeText(selectedSummary.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Browser Print vector PDF downloader
  const handleDownloadPDF = () => {
    if (!selectedSummary) return;
    
    const printWindow = window.open('', '_blank');
    const dateStr = new Date(selectedSummary.createdAt).toLocaleDateString();

    const docContent = `
      <html>
        <head>
          <title>${selectedSummary.title} Summary</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #1e293b;
              padding: 40px;
              line-height: 1.6;
              background-color: #ffffff;
            }
            .header {
              border-bottom: 2px solid #8b5cf6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #7c3aed;
            }
            .meta {
              font-size: 12px;
              color: #64748b;
              margin-top: 5px;
            }
            h1 {
              font-size: 20px;
              margin-top: 0;
              color: #0f172a;
            }
            .summary-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 24px;
              margin-top: 20px;
              font-size: 14px;
              white-space: pre-wrap;
            }
            .details {
              display: flex;
              gap: 20px;
              margin-top: 30px;
              font-size: 11px;
              color: #94a3b8;
              border-top: 1px dashed #cbd5e1;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="logo">SmartSumm AI Summary</span>
            <div class="meta">Generated on ${dateStr}</div>
          </div>
          <h1>Document Title: ${selectedSummary.title}</h1>
          <div class="summary-box">
            ${selectedSummary.summary}
          </div>
          <div class="details">
            <div><strong>Type:</strong> ${selectedSummary.summaryType === 'extractive' ? 'Exact Content Summary (Extractive)' : 'Smart AI Summary (Abstractive)'}</div>
            <div><strong>Length:</strong> ${selectedSummary.summaryLength.toUpperCase()}</div>
            <div><strong>Words:</strong> ${selectedSummary.wordCount} words</div>
            <div><strong>Compiled in:</strong> ${selectedSummary.processingTime}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(docContent);
    printWindow.document.close();
  };

  // Conversational AI Chat Downstream triggering API
  const handleSendChatMessage = async () => {
    if (!chatMessage.trim() || !selectedSummary || chatLoading) return;

    const userMsgObj = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsgObj]);
    setChatMessage('');
    
    try {
      setChatLoading(true);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

      const res = await axios.post(`${API_URL}/summarize/${selectedSummary._id}/chat`, {
        message: chatMessage
      });

      if (res.data.success) {
        setChatHistory(res.data.chatHistory);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  // Filter list by search term
  const filteredSummaries = summaries.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace */}
      <main className="flex-1 min-w-0 p-6 md:p-8 space-y-8 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-900">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Summary Logs History <HistoryIcon className="w-5 h-5 text-brand-400" />
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Load, review, copy, export or continue chats with your processed archives.
            </p>
          </div>
          
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-brand-500 outline-none text-slate-200 text-xs transition"
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="h-64 flex flex-col justify-center items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
            <p className="text-slate-500 text-xs">Loading summary histories...</p>
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl text-center max-w-lg mx-auto mt-10">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-center mx-auto mb-4">
              <HistoryIcon className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-300">No Summaries Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              {searchTerm 
                ? "No matching summaries match your search query." 
                : "You haven't generated any summaries yet. Go to the dashboard to begin!"
              }
            </p>
          </div>
        ) : (
          /* Grid logs list */
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSummaries.map((item) => (
              <div
                key={item._id}
                onClick={() => handleOpenDetail(item._id)}
                className="glass p-5 rounded-2xl cursor-pointer hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between h-48 group relative"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border shrink-0 ${
                      item.summaryType === 'extractive' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                    }`}>
                      {item.summaryType}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, item._id)}
                      className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400 hover:border-slate-700 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-xs font-bold text-white line-clamp-2 leading-relaxed mb-3 pr-4 group-hover:text-brand-300 transition-colors">
                    {item.title}
                  </h3>
                </div>

                {/* Card Footer stats */}
                <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-900 pt-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-600" /> 
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    Words: {item.wordCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DETAILS OVERLAY MODAL */}
        {selectedSummary && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setSelectedSummary(null)}
            />

            {/* Slide-out Panel */}
            <div className="relative z-60 w-full max-w-2xl h-full bg-slate-950 border-l border-slate-900 flex flex-col justify-between shadow-2xl shadow-black/80">
              
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-900 flex items-center justify-between">
                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Summary Archive</h2>
                  <h3 className="text-sm font-bold text-white truncate max-w-md mt-0.5">{selectedSummary.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedSummary(null)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Workspace (Split: Text on top, Chat on bottom) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Statistics Box */}
                <div className="grid grid-cols-3 gap-4 bg-slate-900/30 border border-slate-900 rounded-xl p-4 text-center">
                  <div>
                    <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Type</span>
                    <span className="text-xs font-bold text-white uppercase mt-0.5 inline-block">{selectedSummary.summaryType}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Words Count</span>
                    <span className="text-xs font-bold text-white mt-0.5 inline-block">{selectedSummary.wordCount}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Created Date</span>
                    <span className="text-xs font-bold text-white mt-0.5 inline-block">
                      {new Date(selectedSummary.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Summary Output Board */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-350 uppercase tracking-wider">Summary Content</label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-[9px] font-semibold"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-[9px] font-semibold"
                      >
                        <FileDown className="w-3.5 h-3.5 text-brand-400" />
                        Export PDF
                      </button>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-900/35 border border-slate-900/80 text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans max-h-60 overflow-y-auto">
                    {selectedSummary.summary}
                  </div>
                </div>

                {/* Downstream Chat panel */}
                <div className="border-t border-slate-900 pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4.5 h-4.5 text-brand-400" />
                    <span className="text-xs font-bold text-white">Resume AI Document Dialogue</span>
                  </div>

                  {/* Chat dialog screen */}
                  <div className="h-60 rounded-2xl border border-slate-900 bg-slate-950/40 p-4 overflow-y-auto space-y-3">
                    {chatHistory.length === 0 ? (
                      <div className="h-full flex flex-col justify-center items-center text-center p-4 text-slate-500">
                        <HelpCircle className="w-8 h-8 text-slate-700 mb-2" />
                        <p className="text-[10px] leading-relaxed max-w-xs">
                          No previous follow-up chats. Input a question below to start chatting with this document context!
                        </p>
                      </div>
                    ) : (
                      chatHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                              item.role === 'user'
                                ? 'bg-brand-600 text-white rounded-br-none'
                                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                            }`}
                          >
                            {item.content}
                          </div>
                        </div>
                      ))
                    )}

                    {chatLoading && (
                      <div className="flex flex-col items-start">
                        <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Thinking...
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat input block */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={chatLoading}
                      placeholder="Ask AI about this document..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-850 text-xs focus:border-brand-500/80 outline-none text-slate-200 transition"
                    />
                    <button
                      onClick={handleSendChatMessage}
                      disabled={chatLoading || !chatMessage.trim()}
                      className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
