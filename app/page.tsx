'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Github, User, Zap, Pencil, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  mcpToolsUsed?: string[];
}

interface Member {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  birth_date: string;
  birthplace: string;
  gender: string;
  citizenship: string;
  religion: string;
  address: string;
}

type PageView = 'home' | 'features' | 'about' | 'contact' | 'persona';

const QUICK_ACTIONS = [
  {
    title: 'Talk to Aeron Garma',
    memberName: 'Aeron Garma',
    role: 'UI Designer',
    initials: 'AG',
    prompt: "I want to talk to Aeron Garma.",
  },
  {
    title: 'Talk to Ethan Macadangdang',
    memberName: 'Ethan Macadangdang',
    role: 'UI Designer',
    initials: 'EM',
    prompt: "I want to talk to Ethan Macadangdang.",
  },
];

const DEPT_COLORS: Record<string, string> = {
  'AI Chat Digital Twin': 'bg-blue-900',
  'UI': 'bg-indigo-700',
  'Database Back End': 'bg-slate-700',
};

const DEPT_TAG_COLORS: Record<string, string> = {
  'AI Chat Digital Twin': 'bg-blue-100 text-blue-900',
  'UI': 'bg-indigo-100 text-indigo-800',
  'Database Back End': 'bg-slate-100 text-slate-700',
};

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

const EMPTY_FORM: Omit<Member, 'id'> = {
  name: '', role: '', department: 'AI Chat Digital Twin',
  email: '', birth_date: '', birthplace: '',
  gender: '', citizenship: '', religion: '', address: '',
};

export default function ChatPage() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [scrolled, setScrolled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! Welcome to Digital Twin. You can chat with any of our team members — just tell me who you'd like to talk to!\n\nAvailable members:\n• Aeron Garma\n• Ethan Macadangdang\n\nWho would you like to chat with?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 10);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Persona state
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form, setForm] = useState<Omit<Member, 'id'>>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(data);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentPage === 'persona') fetchMembers();
  }, [currentPage, fetchMembers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string, currentMessages = messages) => {
    if (!text.trim() || isLoading) return;
    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() };
    const updatedMessages = [...currentMessages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    try {
      const apiMessages = [
        ...currentMessages.slice(1).map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
        { role: 'user', content: text },
      ];
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: apiMessages }) });
      const data = await res.json();
      const mcpToolsUsed: string[] = data.mcp_tools_used ?? [];
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: data.reply ?? data.error ?? 'Something went wrong.', sender: 'ai', timestamp: new Date(), mcpToolsUsed }]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: 'Sorry, I encountered an error. Please try again.', sender: 'ai', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    setInput('');
    await sendMessage(text);
  };

  const openAdd = () => { setEditingMember(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (m: Member) => { setEditingMember(m); setForm({ name: m.name, role: m.role, department: m.department, email: m.email, birth_date: m.birth_date, birthplace: m.birthplace, gender: m.gender, citizenship: m.citizenship, religion: m.religion, address: m.address }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingMember(null); };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingMember) {
        await fetch(`/api/members/${editingMember.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      } else {
        await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      }
      closeForm();
      fetchMembers();
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this member?')) return;
    await fetch(`/api/members/${id}`, { method: 'DELETE' });
    fetchMembers();
  };

  const departments = ['AI Chat Digital Twin', 'UI', 'Database Back End'];
  const hasStarted = messages.length > 1;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className={`bg-white border-b border-gray-200 sticky top-0 z-40 transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'shadow-none'}`}>
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-base">DT</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Digital Twin</h1>
              <p className="text-xs font-medium text-emerald-600">● 24/7 Active</p>
            </div>
          </div>

          <nav className="flex gap-8 text-sm font-medium">
            {(['home', 'features', 'about', 'contact', 'persona'] as PageView[]).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`capitalize transition-colors ${currentPage === page ? 'text-blue-900 font-bold' : 'text-gray-700 hover:text-blue-900'}`}
              >
                {page}
              </button>
            ))}
          </nav>

          <a href="https://github.com/arjaypamits/digital-twin-teamproject-pamittan" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 hover:text-blue-900">
            <Github size={20} />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 flex flex-col w-full px-8 py-6 overflow-auto">
        <div className="max-w-5xl mx-auto w-full flex flex-col h-full">

          {/* HOME PAGE */}
          {currentPage === 'home' && (
            <div className="max-w-4xl mx-auto w-full flex flex-col" style={{ height: 'calc(100vh - 88px - 48px)' }}>

              {/* Hero — compact, only before chat starts */}
              {!hasStarted && (
                <div className="mb-4 px-5 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center justify-between flex-shrink-0">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Digital Twin</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Meet the team — talk to any member and get to know them personally.</p>
                  </div>
                  <div className="w-9 h-9 bg-blue-900 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">DT</div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1 min-h-0">

                {messages.map((message) => (
                  <div key={message.id} className={`flex items-end gap-2.5 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                    {/* Avatar */}
                    {message.sender === 'ai' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-0.5">DT</div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mb-0.5">
                        <User size={15} className="text-gray-500" />
                      </div>
                    )}

                    <div className={`flex flex-col gap-1 max-w-[72%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      {message.mcpToolsUsed && message.mcpToolsUsed.length > 0 && (
                        <div className="flex items-center gap-1.5 px-1">
                          <Zap size={11} className="text-emerald-600" />
                          <span className="text-xs text-emerald-600 font-medium">MCP: {message.mcpToolsUsed.map((t) => t.replace(/_/g, ' ')).join(', ')}</span>
                        </div>
                      )}
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        message.sender === 'user'
                          ? 'bg-blue-900 text-white rounded-br-sm shadow-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {message.text}
                      </div>
                      <span className="text-[10px] text-gray-400 px-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Member avatar cards — only before chat starts */}
                {!hasStarted && (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Choose a member to chat with</p>
                    <div className="flex gap-4 flex-wrap justify-center">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.title}
                          onClick={() => sendMessage(action.prompt)}
                          disabled={isLoading}
                          className="flex flex-col items-center gap-2 p-4 w-36 border border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all disabled:opacity-50 group"
                        >
                          <div className="w-14 h-14 rounded-full bg-blue-900 group-hover:bg-blue-800 flex items-center justify-center text-white font-bold text-base transition-colors shadow-sm">
                            {action.initials}
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-gray-900 leading-tight">{action.memberName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{action.role}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-end gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">DT</div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1.5 items-center h-4">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="pt-4 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <Input
                    type="text"
                    placeholder="Type who you want to talk to or ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 text-sm bg-transparent border-0 shadow-none focus-visible:ring-0 px-0 py-0 placeholder:text-gray-400"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-900 hover:bg-blue-800 text-white w-9 h-9 rounded-xl p-0 flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
                  >
                    <Send size={15} />
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* PERSONA PAGE */}
          {currentPage === 'persona' && (
            <div className="flex flex-col gap-6 overflow-y-auto">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Team Personas</h2>
                  <p className="text-sm text-gray-600">Meet the people behind Digital Twin</p>
                </div>
                <Button onClick={openAdd} className="bg-blue-900 hover:bg-blue-800 text-white flex items-center gap-2 text-sm">
                  <Plus size={16} /> Add Member
                </Button>
              </div>

              {membersLoading ? (
                <div className="flex flex-col gap-6">
                  {[3, 4, 2].map((count, gi) => (
                    <div key={gi}>
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-3" />
                      <div className="grid grid-cols-4 gap-4">
                        {Array.from({ length: count }).map((_, i) => (
                          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                              <div className="flex flex-col gap-1.5 flex-1">
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                                <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/2" />
                              </div>
                            </div>
                            <div className="h-5 bg-gray-100 rounded-full animate-pulse w-2/3" />
                            <div className="h-2.5 bg-gray-100 rounded animate-pulse w-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                departments.map((dept) => {
                  const deptMembers = members.filter((m) => m.department === dept);
                  if (deptMembers.length === 0) return null;
                  return (
                    <div key={dept}>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{dept}</h3>
                      <div className="grid grid-cols-4 gap-4">
                        {deptMembers.map((m) => (
                          <div key={m.id} className="relative bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                            <div className="absolute top-3 right-3 flex gap-1">
                              <button onClick={() => openEdit(m)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors"><Pencil size={13} /></button>
                              <button onClick={() => handleDelete(m.id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${DEPT_COLORS[dept] ?? 'bg-gray-700'}`}>
                                {getInitials(m.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 leading-tight truncate pr-8">{m.name}</p>
                                <p className="text-xs text-gray-500 truncate">{m.role}</p>
                              </div>
                            </div>
                            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${DEPT_TAG_COLORS[dept] ?? 'bg-gray-100 text-gray-700'}`}>{dept}</span>
                            {m.email && <p className="text-xs text-gray-400 truncate mt-1">{m.email}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Add / Edit Modal */}
              {showForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900">{editingMember ? 'Edit Member' : 'Add Member'}</h3>
                      <button onClick={closeForm} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleFormSubmit} className="px-6 py-4 space-y-4">
                      {[
                        { label: 'Full Name', key: 'name', required: true },
                        { label: 'Role / Title', key: 'role' },
                        { label: 'Email', key: 'email' },
                        { label: 'Birth Date', key: 'birth_date' },
                        { label: 'Birthplace', key: 'birthplace' },
                        { label: 'Gender', key: 'gender' },
                        { label: 'Citizenship', key: 'citizenship' },
                        { label: 'Religion', key: 'religion' },
                        { label: 'Address', key: 'address' },
                      ].map(({ label, key, required }) => (
                        <div key={key}>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                          <Input
                            value={(form as Record<string, string>)[key]}
                            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                            required={required}
                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                        <select
                          value={form.department}
                          onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
                        >
                          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={closeForm} className="flex-1">Cancel</Button>
                        <Button type="submit" disabled={formLoading} className="flex-1 bg-blue-900 hover:bg-blue-800 text-white">
                          {formLoading ? 'Saving…' : editingMember ? 'Save Changes' : 'Add Member'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FEATURES PAGE */}
          {currentPage === 'features' && (
            <div className="flex flex-col gap-6 overflow-y-auto">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Features</h2>
                <p className="text-sm text-gray-600">Discover what Digital Twin can do for you</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { title: 'Real AI Responses', description: 'Connected to GPT-4 Turbo via OpenRouter — intelligent, nuanced career guidance, not canned responses.' },
                  { title: 'MCP Server Integration', description: 'Built-in MCP (Model Context Protocol) server that exposes career-coaching tools — skill-gap analysis, resume scoring, interview question generation, and career pathing.' },
                  { title: 'Career Profile Analysis', description: 'The AI asks targeted questions about your background, experience level, industry, and aspirations to build a comprehensive profile.' },
                  { title: 'Skill Gap Detection', description: 'Mention your target role and the AI identifies missing skills, recommends specific resources, and provides learning timelines.' },
                  { title: 'Resume & Profile Feedback', description: 'Share your career details and get actionable feedback on how to improve your positioning and presentation.' },
                  { title: 'Interview Preparation', description: 'Request a mock interview and the AI conducts realistic practice sessions with STAR-method feedback on your answers.' },
                  { title: '24/7 Availability', description: 'Always on when you need guidance, support, and expert insights for your career journey.' },
                ].map((feature) => (
                  <div key={feature.title} className="p-5 border border-gray-200 rounded-lg hover:border-blue-900 transition-colors">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABOUT PAGE */}
          {currentPage === 'about' && (
            <div className="flex flex-col gap-6 overflow-y-auto">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">About Digital Twin</h2>
                <p className="text-sm text-gray-600">Learn more about our mission and vision</p>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Our Mission</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Digital Twin is an AI-powered career companion designed to democratize access to professional guidance. We believe everyone deserves expert career advice, personalized to their unique situation and aspirations.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Why Digital Twin?</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Career guidance shouldn&apos;t be limited by geography, time, or budget. Our AI twin is available whenever you need it, providing consistent, knowledgeable advice grounded in real industry insights and best practices.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Our Technology</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Built on GPT-4 Turbo via OpenRouter with an integrated MCP (Model Context Protocol) server, Digital Twin delivers state-of-the-art language understanding enhanced by structured career-coaching tools for accurate, data-driven guidance tailored to your unique situation.</p>
                </div>

                {/* Project Milestones */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Project Milestones</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Week 6 */}
                    <div className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">Week 6</span>
                        <div className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                        </div>
                      </div>
                      <p className="text-white text-sm font-semibold leading-snug">
                        Project Design: Design.md (AI/spec-driven), Implementation Plan, and Base Infrastructure
                      </p>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        Ensures the team has a clear, structured blueprint before writing code — reducing wasted effort, misaligned features, and last-minute reworks by defining the architecture and plan upfront.
                      </p>
                    </div>

                    {/* Week 7 */}
                    <div className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">Week 7</span>
                        <div className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </div>
                      </div>
                      <p className="text-white text-sm font-semibold leading-snug">
                        Interim Working Solution
                      </p>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        Delivers a functional prototype early so the team can test real behavior, gather feedback, and catch issues while there&apos;s still time to fix them before the final submission.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTACT PAGE */}
          {currentPage === 'contact' && (
            <div className="flex flex-col gap-6 overflow-y-auto">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h2>
                <p className="text-sm text-gray-600">Get in touch with the Digital Twin team</p>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
                  <Input type="text" placeholder="Your name" className="w-full text-sm border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <Input type="email" placeholder="your.email@example.com" className="w-full text-sm border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Message</label>
                  <textarea placeholder="Your message here..." rows={4} className="w-full text-sm border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-100 transition-all resize-none" />
                </div>
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium transition-all">Send Message</Button>
              </form>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Other Ways to Connect</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Email: support@digitaltwin.ai</p>
                  <p>Phone: +1 (555) 123-4567</p>
                  <p>GitHub: <a href="https://github.com/arjaypamits/digital-twin-teamproject-pamittan" target="_blank" rel="noopener noreferrer" className="text-blue-900 hover:underline font-medium">github.com/arjaypamits</a></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-5 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">AI Chat Digital Twin</h3>
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                <li className="text-xs text-gray-600 font-medium">John Michael Talbo</li>
                <li className="text-xs text-gray-600 font-medium">Arjay Pamittan</li>
                <li className="text-xs text-gray-600 font-medium">Marc Ruben Lucas</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">UI</h3>
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                <li className="text-xs text-gray-600 font-medium">Aeron Garma</li>
                <li className="text-xs text-gray-600 font-medium">Prince Ethan Macadangdang</li>
                <li className="text-xs text-gray-600 font-medium">Peter Cauan</li>
                <li className="text-xs text-gray-600 font-medium">Michael Josh Jacinto</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Database Back End</h3>
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                <li className="text-xs text-gray-600 font-medium">Aaron Clerf Sarambao</li>
                <li className="text-xs text-gray-600 font-medium">Christian Jerald Martinez</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-3 text-xs text-gray-400 text-center">
            <p>Built with precision. Powered by AI. © 2024 Digital Twin</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
