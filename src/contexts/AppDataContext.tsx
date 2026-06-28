import React, { createContext, useContext, useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types';
import { useAuth } from './AuthContext';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Goal = Database['public']['Tables']['goals']['Row'];

export interface ActiveSession {
  goal_id: string;
  started_at: string;
  duration_minutes: number;
}

interface AppDataContextType {
  profiles: Profile[];
  goals: Goal[];
  loading: boolean;
  refreshData: () => Promise<void>;
  onlineUsers: string[];
  activeSessions: Record<string, ActiveSession>;
  setMyActiveSession: (session: ActiveSession | null) => Promise<void>;
  broadcastMessage: (message: Database['public']['Tables']['messages']['Row']) => void;
  onNewMessage: ((message: Database['public']['Tables']['messages']['Row']) => void) | null;
  setOnNewMessage: (cb: ((message: Database['public']['Tables']['messages']['Row']) => void) | null) => void;
}

const AppDataContext = createContext<AppDataContextType>({
  profiles: [],
  goals: [],
  loading: true,
  refreshData: async () => {},
  onlineUsers: [],
  activeSessions: {},
  setMyActiveSession: async () => {},
  broadcastMessage: () => {},
  onNewMessage: null,
  setOnNewMessage: () => {},
});

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [activeSessions, setActiveSessions] = useState<Record<string, ActiveSession>>({});
  const [presenceChannel, setPresenceChannel] = useState<RealtimeChannel | null>(null);
  const [onNewMessage, setOnNewMessage] = useState<((message: Database['public']['Tables']['messages']['Row']) => void) | null>(null);

  // We need a stable ref for the callback so the channel subscription doesn't get stale
  const onNewMessageRef = React.useRef(onNewMessage);
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    const [profilesRes, goalsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('total_points', { ascending: false }),
      supabase.from('goals').select('*').order('created_at', { ascending: false })
    ]);

    if (profilesRes.data) setProfiles(profilesRes.data);
    if (goalsRes.data) setGoals(goalsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      setProfiles([]);
      setGoals([]);
      setOnlineUsers([]);
      setActiveSessions({});
      return;
    }

    fetchData();

    // Data changes channel
    const dbChannel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => fetchData())
      .subscribe();

    // Presence & Broadcast channel
    const pChannel = supabase.channel('online-users', {
      config: { presence: { key: user.id } },
    });

    pChannel.on('presence', { event: 'sync' }, () => {
      const state = pChannel.presenceState();
      const online: string[] = [];
      const sessions: Record<string, ActiveSession> = {};
      
      for (const id in state) {
        online.push(id);
        const userState = state[id][0] as any; 
        if (userState?.active_session) {
          sessions[id] = userState.active_session;
        }
      }
      setOnlineUsers(online);
      setActiveSessions(sessions);
    });

    pChannel.on('broadcast', { event: 'new_message' }, (payload) => {
      if (onNewMessageRef.current) {
        onNewMessageRef.current(payload.payload);
      }
    });

    pChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const savedSession = localStorage.getItem('versus_active_session');
        const parsedSession = savedSession ? JSON.parse(savedSession) : null;
        
        await pChannel.track({ 
          online_at: new Date().toISOString(),
          active_session: parsedSession
        });
      }
    });

    setPresenceChannel(pChannel);

    return () => {
      supabase.removeChannel(dbChannel);
      supabase.removeChannel(pChannel);
    };
  }, [user]);

  const setMyActiveSession = async (session: ActiveSession | null) => {
    if (session) {
      localStorage.setItem('versus_active_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('versus_active_session');
    }

    if (presenceChannel) {
      await presenceChannel.track({
        online_at: new Date().toISOString(),
        active_session: session
      });
    }
  };

  const broadcastMessage = (message: Database['public']['Tables']['messages']['Row']) => {
    if (presenceChannel) {
      presenceChannel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: message
      });
    }
  };

  return (
    <AppDataContext.Provider value={{ 
      profiles, 
      goals, 
      loading, 
      refreshData: fetchData,
      onlineUsers,
      activeSessions,
      setMyActiveSession,
      broadcastMessage,
      onNewMessage,
      setOnNewMessage
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => useContext(AppDataContext);
