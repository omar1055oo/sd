import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { Database } from '../types';
import { Send, Play, Trophy, Target, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Message = Database['public']['Tables']['messages']['Row'];

export function Chat() {
  const { user } = useAuth();
  const { profiles, goals, setOnNewMessage, broadcastMessage } = useAppData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Set the callback for new broadcasted messages
    setOnNewMessage((newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    // Fallback: Postgres replication if enabled
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages(prev => {
            const newMsg = payload.new as Message;
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      setOnNewMessage(null);
      supabase.removeChannel(channel);
    };
  }, [setOnNewMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      // If table doesn't exist yet, show a helpful message
      if (err.message && err.message.includes('relation "public.messages" does not exist')) {
        setError('Chat is not fully set up yet. Please ask the developer to run the SQL migration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      // Optimistic update using a temporary ID
      const tempId = crypto.randomUUID();
      const tempMessage: Message = {
        id: tempId,
        user_id: user.id,
        content,
        type: 'text',
        metadata: null,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempMessage]);
      scrollToBottom();

      const { data, error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          content,
          type: 'text'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update with the actual data from server
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));

      // Broadcast to other clients immediately
      broadcastMessage(data);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const getProfile = (userId: string) => profiles.find(p => p.id === userId);

  const renderMessageContent = (message: Message) => {
    const meta = message.metadata as any;
    
    if (message.type === 'goal_share') {
      return (
        <div className="bg-white/10 rounded-lg p-3 mt-1 border border-white/20">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-blue-300" />
            <span className="font-semibold text-sm">New Goal Created</span>
          </div>
          <p className="text-sm">{meta?.title || 'A new goal'}</p>
        </div>
      );
    }

    if (message.type === 'achievement') {
      return (
        <div className="bg-amber-500/20 rounded-lg p-3 mt-1 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span className="font-semibold text-sm text-amber-100">Goal Completed!</span>
          </div>
          <p className="text-sm font-medium">{meta?.title || 'An achievement'}</p>
          <p className="text-xs opacity-80 mt-1">Earned +{meta?.points} pts</p>
        </div>
      );
    }

    if (message.type === 'session_invite') {
      return (
        <div className="bg-green-500/20 rounded-lg p-3 mt-1 border border-green-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-4 h-4 text-green-300" />
            <span className="font-semibold text-sm text-green-100">Study Session Started</span>
          </div>
          <p className="text-sm mb-2">{meta?.title || 'A study session'}</p>
          {meta?.duration_minutes && (
            <p className="text-xs opacity-80 mb-2">Duration: {meta.duration_minutes} mins</p>
          )}
          {message.user_id !== user?.id && (
            <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors font-medium">
              Join Session (Work in progress)
            </button>
          )}
        </div>
      );
    }

    return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-[600px] flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[calc(100vh-12rem)] min-h-[500px] transition-colors overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rivals Chat</h2>
        <span className="text-xs font-medium px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
          {profiles.length} Participants
        </span>
      </div>

      {error ? (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
          <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">Setup Required</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">{error}</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-gray-500 mt-10">
                <p>No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMe = message.user_id === user?.id;
                const profile = getProfile(message.user_id);

                return (
                  <div key={message.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 mb-1">
                        {profile?.display_name || profile?.email}
                      </span>
                    )}
                    <div 
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isMe 
                          ? 'bg-blue-600 dark:bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-bl-none shadow-sm'
                      }`}
                    >
                      {renderMessageContent(message)}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 mx-1">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
