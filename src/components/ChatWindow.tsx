/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Send, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react';

interface ChatWindowProps {
  chats: ChatMessage[];
  currentUserId: string;
  currentUsername: string;
  currentUserRole: string;
  onSendMessage: (text: string, targetRole: 'all' | 'admin' | 'manager' | 'cashier') => void;
}

export default function ChatWindow({ chats, currentUserId, currentUsername, currentUserRole, onSendMessage }: ChatWindowProps) {
  const [text, setText] = useState('');
  const [target, setTarget] = useState<'all' | 'admin' | 'manager' | 'cashier'>('all');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text, target);
    setText('');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'cashier':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col h-[400px]" id="corporate-chat-window">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC] rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#DBEAFE] text-[#3B82F6] rounded-lg">
            <MessageSquare className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-bold text-[#0F172A] text-sm tracking-tight">Internal Operations Chat</h3>
            <p className="text-[10px] text-slate-400">Collaborate with store floor team and executives</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3 text-[#3B82F6] animate-pulse" />
          Role: <span className="font-bold text-[#1E40AF] uppercase">{currentUserRole}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {chats.map((msg) => {
          const isSelf = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                <span className="font-semibold text-slate-600">{msg.senderName}</span>
                <span className={`px-1.5 py-0.2 rounded border text-[9px] uppercase ${getRoleBadge(msg.senderRole)}`}>
                  {msg.senderRole}
                </span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.targetRole !== 'all' && (
                  <span className="bg-rose-50 text-rose-600 px-1 py-0.2 rounded text-[8px] font-bold border border-rose-100">
                    → SECURE: {msg.targetRole.toUpperCase()}
                  </span>
                )}
              </div>
              <div
                className={`px-3.5 py-2 rounded-xl text-xs max-w-[85%] break-words shadow-sm ${
                  isSelf
                    ? 'bg-[#3B82F6] text-white rounded-tr-none'
                    : 'bg-[#F1F5F9] text-[#1E293B] rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Form Footer */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] rounded-b-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-slate-400 font-medium">Post to:</span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as any)}
            className="text-[10px] bg-white border border-[#E2E8F0] rounded px-1.5 py-0.5 text-slate-600 font-semibold focus:outline-none focus:border-[#3B82F6] cursor-pointer"
          >
            <option value="all">Broadcast (All Staff)</option>
            <option value="admin">🔒 CEO / Admin Only</option>
            <option value="manager">🔒 Managers Only</option>
            <option value="cashier">🔒 Cashiers Only</option>
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Reply as ${currentUsername}...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] shadow-sm"
          />
          <button
            type="submit"
            className="p-2 bg-[#3B82F6] text-white hover:bg-blue-700 active:scale-95 rounded-lg transition-all duration-150 shadow-sm flex items-center justify-center min-w-[36px] cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
