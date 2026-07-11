import React, { useState } from 'react';
import { 
  HelpCircle, MessageSquare, Send, CheckCircle, Clock, ShieldAlert, AlertCircle 
} from 'lucide-react';

export default function CustomerSupport() {
  const [activeTab, setActiveTab] = useState<'faq' | 'chat' | 'ticket'>('faq');

  // 1. FAQ States
  const faqs = [
    { q: "What is your return and refund policy?", a: "You can request an automated refund directly from your Orders page for any completed or shipped order. Defective items can be replaced by uploading an image. Refunds will post directly to your prepaid Store Wallet instantly!" },
    { q: "How do Split Payments work?", a: "During checkout, select 'Split UPI + Card'. You can customize the exact cash allocation paid via UPI QR and Credit Card. This allows you to split large ticket invoices across multiple payment methods." },
    { q: "Can I schedule recurring delivery subscriptions?", a: "Yes! Essentials like fresh milk and farm vegetables can be subscribed to under the 'Recurring Deliveries' tab. You can select delivery frequency (daily, weekly) and pause/resume at any time." },
    { q: "What are Loyalty Points and Wallet funds?", a: "Every online purchase yields a 10% points cashback. Loyalty points count toward upgrading your membership tier (Bronze -> Silver -> Gold). Wallet funds can be pre-loaded using any card for one-click express checkouts." }
  ];
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // 2. Interactive Support Chat States
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    { sender: 'agent', text: 'Hello! Welcome to RetailMind Support. I am your Live Help Agent. How can I assist you with your orders, wallets or deliveries today?', time: 'Just now' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: 'Just now' }]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate Agent response
    setTimeout(() => {
      setIsTyping(false);
      let reply = "Thank you for contacting RetailMind. Your query has been logged. Let me pull up your account profile to double-check that for you.";
      
      if (userMsg.toLowerCase().includes('refund') || userMsg.toLowerCase().includes('return')) {
        reply = "I see! To file a refund or return claim, go to your 'Web Orders' tab, locate the delivered invoice, and click 'Request Automated Refund'. You can also file exchange request tickets there.";
      } else if (userMsg.toLowerCase().includes('wallet') || userMsg.toLowerCase().includes('balance')) {
        reply = "You can view your Wallet Balance and instantly top up funds via card under the 'Profile & Wallet' tab in your side menu.";
      } else if (userMsg.toLowerCase().includes('delivery') || userMsg.toLowerCase().includes('track')) {
        reply = "Our GPS live delivery tracker is fully active! On the 'Web Orders' tab, click 'Track Delivery Status' on any pending or processing order to see the courier moving in real-time on our city map.";
      }

      setChatMessages(prev => [...prev, { sender: 'agent', text: reply, time: 'Just now' }]);
    }, 1500);
  };

  // 3. Ticket Filing States
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Order Issue');
  const [ticketDescription, setTicketDescription] = useState('');
  const [raisedTicketId, setRaisedTicketId] = useState('');

  const submitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      alert('Please fill out all fields before filing support tickets.');
      return;
    }
    const tid = `TK-${Math.floor(10000 + Math.random() * 90000)}`;
    setRaisedTicketId(tid);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6" id="customer-support-hub">
      
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" /> Customer Support Center
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Solve issues, submit Defective items claims, or chat with support agents in real-time.</p>
        </div>

        {/* Support Section Switchers */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-[10px] font-bold">
          <button 
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${activeTab === 'faq' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
          >
            📋 FAQs List
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${activeTab === 'chat' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
          >
            💬 Support Live Chat
          </button>
          <button 
            onClick={() => setActiveTab('ticket')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${activeTab === 'ticket' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
          >
            🎫 Submit Ticket
          </button>
        </div>
      </div>

      {/* FAQ PORTAL */}
      {activeTab === 'faq' && (
        <div className="space-y-3.5 text-xs">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100/60 font-bold text-slate-700 flex justify-between items-center cursor-pointer transition-colors"
              >
                <span>{faq.q}</span>
                <span className="text-lg text-slate-400">{expandedFaq === idx ? '−' : '+'}</span>
              </button>
              {expandedFaq === idx && (
                <div className="p-3.5 bg-white border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SUPPORT LIVE CHAT SIMULATION */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-[340px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50" id="support-live-chat-panel">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-3 flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <span>Rider Support Agent Online</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">ID: AG-9283</span>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-[11px] scrollbar-thin">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] text-slate-400 mb-0.5">{msg.sender === 'user' ? 'You' : 'Support Desk'}</span>
                <div className={`p-2.5 rounded-lg max-w-[85%] break-words leading-relaxed ${
                  msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-[10px] text-slate-400 italic font-mono flex items-center gap-1 animate-pulse">
                <span>Agent Johnathan is typing support reply...</span>
              </div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="p-2 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="e.g. How can I cancel my milk subscription or request refund?"
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* HELP TICKET SUBMISSION FORM */}
      {activeTab === 'ticket' && (
        <div className="space-y-4 text-xs">
          
          {raisedTicketId ? (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-4">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="space-y-1.5 max-w-xs mx-auto">
                <h4 className="font-extrabold text-slate-800 text-sm">Support Ticket Logged!</h4>
                <p className="text-[11px] text-slate-400">Our desk has cataloged your issue. An operations manager is reviewing the claim details.</p>
                <div className="bg-white border border-slate-100 font-mono text-xs py-2 rounded font-bold text-slate-700 mt-2">
                  Reference: {raisedTicketId}
                </div>
              </div>
              <button 
                onClick={() => setRaisedTicketId('')}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg cursor-pointer"
              >
                File Another Ticket
              </button>
            </div>
          ) : (
            <form onSubmit={submitTicket} className="space-y-4" id="ticket-submit-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[9px]">Ticket Subject / Header:</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Milk delivered damaged / Defective claim"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[9px]">Select Issue Category:</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Order Issue">Order Issue / Defective Product</option>
                    <option value="Payment Issue">Payment Refund / Wallet Dispute</option>
                    <option value="Account Issue">Membership Tier / Account Login</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase text-[9px]">Elaborate Issue (Defective details, etc):</label>
                <textarea
                  rows={3}
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Provide any orders references, item descriptions or details regarding defective packaging to qualify fast-track approvals..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              {/* Defective claim fake file uploader */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase text-[9px]">Upload Image proof of Defective item (Optional):</label>
                <div className="border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 rounded-xl p-3 text-center cursor-pointer">
                  <span className="text-[10px] text-slate-400 font-bold block">📂 Drag-and-drop or Click to select image files</span>
                  <span className="text-[8px] text-slate-300 block font-mono mt-0.5">Supports PNG, JPEG up to 5MB</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs tracking-wider transition-all cursor-pointer shadow-xs"
              >
                Log Support Claim Ticket
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
