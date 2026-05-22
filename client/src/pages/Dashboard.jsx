import React, { useState, useRef } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  ShieldCheck, 
  Brain, 
  Sliders, 
  Check, 
  Copy, 
  Download, 
  FileDown,
  RefreshCw, 
  Send, 
  MessageSquare,
  ChevronRight,
  Trash2,
  HelpCircle,
  Clock,
  ArrowRightLeft
} from 'lucide-react';

export default function Dashboard() {
  const { user, API_URL } = useAuth();

  // Input states
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'upload'
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Configuration states
  const [summaryType, setSummaryType] = useState('extractive'); // 'extractive' | 'abstractive'
  const [summaryLength, setSummaryLength] = useState('medium'); // 'short' | 'medium' | 'detailed'

  // Loading & Processing states
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Output states
  const [result, setResult] = useState(null); // { id, summary, summaryType, wordCount, processingTime }
  const [copied, setCopied] = useState(false);

  // Chat states
  const [chatActive, setChatActive] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // File drag & drop triggers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMsg('');
    const allowedExtensions = ['pdf', 'docx', 'txt'];
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      return setErrorMsg('Unsupported file format. Please upload PDF, DOCX, or TXT files only.');
    }
    
    if (file.size > 10 * 1024 * 1024) {
      return setErrorMsg('File is too large. Maximum size limit is 10MB.');
    }
    
    setSelectedFile(file);
  };

  const resetFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrorMsg('');
  };

  // Summarize triggering API
  const handleSummarize = async () => {
    setErrorMsg('');
    setResult(null);
    setChatHistory([]);
    setChatActive(false);

    // Validate
    if (activeTab === 'paste' && !rawText.trim()) {
      return setErrorMsg('Please paste some text content to summarize.');
    }
    if (activeTab === 'upload' && !selectedFile) {
      return setErrorMsg('Please drag or upload a file to summarize.');
    }

    try {
      setProcessing(true);
      setProgressMsg('Reading content layers...');

      let response;
      
      if (activeTab === 'paste') {
        setTimeout(() => setProgressMsg('Analysing sentence densities...'), 600);
        setTimeout(() => setProgressMsg('Compiling summary matrix...'), 1200);

        response = await axios.post(`${API_URL}/summarize/text`, {
          content: rawText,
          summaryType,
          summaryLength
        });
      } else {
        setTimeout(() => setProgressMsg('Uploading binary buffers...'), 500);
        setTimeout(() => setProgressMsg('Extracting text channels...'), 1000);
        setTimeout(() => setProgressMsg('Formulating summary structures...'), 1800);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('summaryType', summaryType);
        formData.append('summaryLength', summaryLength);

        response = await axios.post(`${API_URL}/summarize/file`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (response.data.success) {
        setResult(response.data);
        setChatActive(true);
        // Trigger confetti!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#8b5cf6', '#06b6d4', '#10b981']
        });
      }
    } catch (err) {
      console.error('Summarize error:', err);
      setErrorMsg(err.response?.data?.error || 'Summarization failed. Please check your network or try again.');
    } finally {
      setProcessing(false);
      setProgressMsg('');
    }
  };

  // Copy to clipboard helper
  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clean, Vector Browser-Print PDF download helper
  const handleDownloadPDF = () => {
    if (!result) return;
    
    // Create new print window framework
    const printWindow = window.open('', '_blank');
    const title = activeTab === 'upload' ? selectedFile.name : 'SmartSumm AI Document';
    const dateStr = new Date().toLocaleDateString();

    const docContent = `
      <html>
        <head>
          <title>${title} Summary</title>
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
            <div class="meta">Exported on ${dateStr}</div>
          </div>
          <h1>Document Title: ${title}</h1>
          <div class="summary-box">
            ${result.summary}
          </div>
          <div class="details">
            <div><strong>Type:</strong> ${result.summaryType === 'extractive' ? 'Exact Content Summary (Extractive)' : 'Smart AI Summary (Abstractive)'}</div>
            <div><strong>Length:</strong> ${summaryLength.toUpperCase()}</div>
            <div><strong>Words:</strong> ${result.wordCount} words</div>
            <div><strong>Compiled in:</strong> ${result.processingTime}</div>
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
  const handleSendChatMessage = async (presetText = '') => {
    const textToSend = presetText || chatMessage;
    if (!textToSend.trim() || !result || chatLoading) return;

    setErrorMsg('');
    const userMsgObj = { role: 'user', content: textToSend };
    setChatHistory(prev => [...prev, userMsgObj]);
    setChatMessage('');
    
    try {
      setChatLoading(true);
      // Auto scroll
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

      const res = await axios.post(`${API_URL}/summarize/${result.id}/chat`, {
        message: textToSend
      });

      if (res.data.success) {
        setChatHistory(res.data.chatHistory);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setErrorMsg(err.response?.data?.error || 'AI Assistant failed to reply. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const presetQuestions = [
    "Explain more",
    "Simplify this",
    "Give key points",
    "Explain like a beginner"
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace */}
      <main className="flex-1 min-w-0 p-6 md:p-8 space-y-8 overflow-y-auto max-h-screen">
        {/* Greetings header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-900">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Welcome, {user?.name || 'Summarizer'} <Sparkles className="w-5 h-5 text-brand-400" />
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Select your documents, pick your parameters, and compile clarity.
            </p>
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* LEFT: Configure panel */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Input Options Card */}
            <div className="glass p-6 rounded-2xl space-y-6">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-800 pb-3">
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all ${
                    activeTab === 'paste'
                      ? 'bg-slate-900 border border-slate-800 text-brand-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Paste Text content
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all ${
                    activeTab === 'upload'
                      ? 'bg-slate-900 border border-slate-800 text-brand-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Upload className="w-4 h-4" /> Upload Document file
                </button>
              </div>

              {/* Input Area */}
              {activeTab === 'paste' ? (
                <div className="space-y-2">
                  <textarea
                    rows={8}
                    placeholder="Paste your research notes, blogs, reports, or articles here..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 outline-none text-slate-200 text-sm placeholder:text-slate-600 transition-all font-sans leading-relaxed resize-y"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-500 px-1">
                    <span>Word Count: {rawText.split(/\s+/).filter(Boolean).length}</span>
                    <span>Chars: {rawText.length} characters</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedFile ? (
                    <div className="p-4 rounded-xl bg-slate-900/30 border border-brand-500/30 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-brand-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate">{selectedFile.name}</p>
                          <p className="text-[10px] text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF/DOCX Document</p>
                        </div>
                      </div>
                      <button
                        onClick={resetFile}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 hover:text-rose-300 hover:border-slate-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-48 border-2 border-dashed rounded-2xl flex flex-col justify-center items-center cursor-pointer transition-all ${
                        dragActive
                          ? 'border-brand-500 bg-brand-500/5'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-300">Drag & drop files here, or browse files</p>
                      <p className="text-[10px] text-slate-500 mt-1">Supports PDF, DOCX, and TXT (up to 10MB)</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
                <Sliders className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Interactive Cards: Summarization Mode Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">
                Select Summarization Mode
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Card 1: Extractive */}
                <div
                  onClick={() => setSummaryType('extractive')}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between h-40 ${
                    summaryType === 'extractive'
                      ? 'bg-slate-900/50 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'bg-slate-900/20 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      summaryType === 'extractive' ? 'bg-emerald-500/10' : 'bg-slate-850'
                    }`}>
                      <ShieldCheck className={`w-5 h-5 ${summaryType === 'extractive' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    </div>
                    {summaryType === 'extractive' && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-slate-950 font-bold" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Exact Content Summary</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      No hallucination. Bulleted extraction of verbatim key sentences. Strict factuality.
                    </p>
                  </div>
                </div>

                {/* Card 2: Abstractive */}
                <div
                  onClick={() => setSummaryType('abstractive')}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between h-40 ${
                    summaryType === 'abstractive'
                      ? 'bg-slate-900/50 border-brand-500/40 shadow-lg shadow-brand-500/5'
                      : 'bg-slate-900/20 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      summaryType === 'abstractive' ? 'bg-brand-500/10' : 'bg-slate-850'
                    }`}>
                      <Brain className={`w-5 h-5 ${summaryType === 'abstractive' ? 'text-brand-400' : 'text-slate-500'}`} />
                    </div>
                    {summaryType === 'abstractive' && (
                      <span className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-slate-950 font-bold" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Smart AI Summary</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Deep AI synthesis. Beginner-friendly conversational explanation. Real-world analogies.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pl-1">
                Choose the summary style that best matches your analytical needs.
              </p>
            </div>

            {/* Length chips */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">
                Select Summary Length
              </label>
              <div className="flex gap-3">
                {['short', 'medium', 'detailed'].map((len) => (
                  <button
                    key={len}
                    onClick={() => setSummaryLength(len)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                      summaryLength === len
                        ? 'bg-brand-500/10 border-brand-500 text-brand-300'
                        : 'bg-slate-900/30 border-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {len} Summary
                  </button>
                ))}
              </div>
            </div>

            {/* CTA action button */}
            <button
              onClick={handleSummarize}
              disabled={processing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 font-bold text-white shadow-xl shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> {progressMsg}
                </>
              ) : (
                <>
                  Generate Document Summary <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>

          </div>

          {/* RIGHT: Results & Chat Board */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Summary View Panel */}
            <div className="glass p-6 rounded-2xl flex flex-col justify-between min-h-[450px]">
              
              {result ? (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header stats bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-900">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          result.summaryType === 'extractive' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                        }`}>
                          {result.summaryType}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {result.processingTime}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Words: <strong>{result.wordCount}</strong>
                      </span>
                    </div>

                    {/* Styled text viewport */}
                    <div className="py-4 text-slate-200 text-xs md:text-sm font-sans leading-relaxed whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                      {result.summary}
                    </div>
                  </div>

                  {/* Actions Panel */}
                  <div className="flex gap-3 pt-4 border-t border-slate-900">
                    <button
                      onClick={handleCopy}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy Summary
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition flex items-center justify-center gap-2"
                    >
                      <FileDown className="w-4 h-4 text-brand-400" /> Export PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-300">Ready for Summary</h3>
                  <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-relaxed">
                    Paste text or upload a document PDF/DOCX on the left, choose your style, and launch.
                  </p>
                </div>
              )}

            </div>

            {/* Downstream AI Chat chatbot panel removed per request (no UI rendered) */}

          </div>

        </div>
      </main>
    </div>
  );
}
