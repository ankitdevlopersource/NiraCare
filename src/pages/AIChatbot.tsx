import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Languages, 
  Filter, 
  ArrowLeft, 
  Sparkles,
  Stethoscope,
  AlertTriangle,
  Info,
  Timer,
  Volume2,
  Mic,
  MicOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
];

const CATEGORIES = [
  { id: 'general', label: 'General Health', icon: Info, color: 'bg-blue-100 text-blue-600' },
  { id: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
  { id: 'symptoms', label: 'Symptom Checker', icon: Stethoscope, color: 'bg-emerald-100 text-emerald-600' },
];

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

export default function AIChatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I am Nira, your friendly AI Health Assistant. ✨ How can I help you today? Please select your language and category to get started. 🩺",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const cleanTextForSpeech = (text: string) => {
    // Remove emojis and special characters for cleaner speech
    return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
               .replace(/\([^)]*\)/g, '') // Remove text in parentheses (e.g., translations)
               .replace(/[#*`~_]/g, '') // Remove markdown characters
               .trim();
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const cleaned = cleanTextForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(cleaned);
      
      // Set language based on selection
      utterance.lang = selectedLang === 'hi' ? 'hi-IN' : 
                       selectedLang === 'bn' ? 'bn-IN' :
                       selectedLang === 'te' ? 'te-IN' :
                       selectedLang === 'mr' ? 'mr-IN' : 'en-US';
      
      utterance.rate = 0.9; // Slightly slower for human-like feel
      utterance.pitch = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = selectedLang === 'hi' ? 'hi-IN' : 
                       selectedLang === 'bn' ? 'bn-IN' :
                       selectedLang === 'te' ? 'te-IN' :
                       selectedLang === 'mr' ? 'mr-IN' : 'en-US';
    
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInput(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
      }
    };

    recognition.start();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: Message = {
      id: botMessageId,
      text: "",
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, initialBotMessage]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3.1-pro-preview";
      
      const langName = LANGUAGES.find(l => l.code === selectedLang)?.name || 'English';
      
      const systemInstruction = `
        You are Nira, a friendly, empathetic, and professional AI Health Assistant. 
        Your goal is to provide helpful health advice and support in a way that feels human and engaging.
        
        Current Context: Category - ${selectedCategory}, Language - ${langName}.
        
        Rules:
        1. Always respond in ${langName}.
        2. Introduce yourself as Nira if appropriate.
        3. Use a warm, human-like tone. Be empathetic and supportive.
        4. Use emojis to make the conversation more engaging and attractive (e.g., 👋, 🩺, 💊, 🚑, ✨, ❤️).
        5. Use clear bullet points for steps, treatments, or lists to make them easy to read.
        6. If the user describes symptoms, identify potential issues and provide immediate FIRST TREATMENT/FIRST AID suggestions.
        7. ALWAYS include a disclaimer that you are an AI and they should consult a real doctor immediately for serious issues.
        8. If it's an emergency, tell them to call an ambulance immediately 🚑.
        9. Keep responses structured, concise, and visually appealing.
      `;

      const responseStream = await ai.models.generateContentStream({
        model: model,
        contents: currentInput,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      let fullText = "";
      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          setMessages(prev => prev.map(m => 
            m.id === botMessageId ? { ...m, text: fullText } : m
          ));
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => prev.map(m => 
        m.id === botMessageId ? { ...m, text: "Sorry, I'm having trouble connecting. Please check your internet or try again later." } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden relative">
      {/* Atmospheric Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 left-1/2 w-64 h-64 bg-teal-500/15 rounded-full blur-[90px]"
        />
      </div>

      {/* Header */}
      <header className="bg-slate-950/50 backdrop-blur-2xl border-b border-white/5 px-6 py-5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-5">
          <motion.button 
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/70 hover:text-white border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative z-10">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-40 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Nira AI</h1>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Live Assistant</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-3 transition-all border border-white/10 text-white/80"
            >
              <Languages className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-widest">{selectedLang}</span>
            </motion.button>
            <div className="absolute right-0 mt-3 w-48 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 p-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-white/5 rounded-xl flex items-center justify-between transition-colors ${selectedLang === lang.code ? 'text-emerald-400 font-bold bg-white/5' : 'text-white/60'}`}
                >
                  <span className="font-bold">{lang.name}</span>
                  <span className="text-[10px] opacity-40 font-medium">{lang.native}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Category Selector */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/5 px-6 py-3 flex gap-3 overflow-x-auto no-scrollbar z-10">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id 
                ? `bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]` 
                : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:text-white/60'
            }`}
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 custom-scrollbar relative">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform hover:scale-110 ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-white to-slate-200 text-slate-950' 
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                }`}>
                  {msg.sender === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                </div>
                <div className={`p-5 rounded-2xl backdrop-blur-xl border transition-all hover:shadow-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-white/95 text-slate-950 rounded-tr-none border-white/20 shadow-xl' 
                    : 'bg-white/10 text-white rounded-tl-none border-white/10 shadow-lg hover:bg-white/15'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                  <div className={`flex items-center gap-4 mt-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && msg.text && (
                      <button 
                        onClick={() => speak(msg.text)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-emerald-400"
                        title="Listen to response"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex items-center gap-2 opacity-40">
                      <Timer className="w-3 h-3" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg animate-pulse">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-5 rounded-2xl rounded-tl-none shadow-lg flex items-center gap-2">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-emerald-400 rounded-full"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-emerald-400 rounded-full"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-emerald-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-950/50 backdrop-blur-xl border-t border-white/10 z-20">
        <form 
          onSubmit={handleSendMessage}
          className="relative flex items-center gap-3 max-w-4xl mx-auto"
        >
          <div className="absolute left-4 text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <button
              type="button"
              onClick={toggleListening}
              className={`p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-white/10 text-emerald-400'}`}
              title={isListening ? "Listening..." : "Voice typing"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Describe your symptoms or ask a question..."}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-24 pr-14 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all backdrop-blur-md"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-center text-white/30 mt-4 font-medium uppercase tracking-[0.2em]">
          AI Assistant can make mistakes. Always consult a medical professional.
        </p>
      </div>
    </div>
  );
}
