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
}

const AppDataContext = createContext<AppDataContextType>({
  profiles: [],
  goals: [],
  loading: true,
  refreshData: async () => {},
  onlineUsers: [],
  activeSessions: {},
  setMyActiveSession: async () => {},
});

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [activeSessions, setActiveSessions] = useState<Record<string, ActiveSession>>({});
  const [presenceChannel, setPresenceChannel] = useState<RealtimeChannel | null>(null);

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

    // Presence channel
    const pChannel = supabase.channel('online-users', {
      config: { presence: { key: user.id } },
    });

    pChannel.on('presence', { event: 'sync' }, () => {
      const state = pChannel.presenceState();
      const online: string[] = [];
      const sessions: Record<string, ActiveSession> = {};
      
      for (const id in state) {
        online.push(id);
        // Take the most recent presence state for this user
        const userState = state[id][0] as any; 
        if (userState?.active_session) {
          sessions[id] = userState.active_session;
        }
      }
      setOnlineUsers(online);
      setActiveSessions(sessions);
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

  return (
    <AppDataContext.Provider value={{ 
      profiles, 
      goals, 
      loading, 
      refreshData: fetchData,
      onlineUsers,
      activeSessions,
      setMyActiveSession
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => useContext(AppDataContext);
