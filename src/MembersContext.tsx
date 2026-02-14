import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import type { Member } from './types';

type MembersContextType = {
  members: Member[];
  loading: boolean;
  addMember: (name: string) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  refreshMembers: () => Promise<void>;
};

const MembersContext = createContext<MembersContextType | undefined>(undefined);

export const useMembers = () => {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error('useMembers must be used within MembersProvider');
  return ctx;
};

export const MembersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMembers = useCallback(async () => {
    try {
      const res = await axios.get<Member[]>('/api/members');
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  const addMember = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const res = await axios.post<Member>('/api/members', { name: trimmed });
    setMembers((prev) => [...prev, { id: res.data.id, name: trimmed }]);
  }, []);

  const removeMember = useCallback(async (id: string) => {
    await axios.delete(`/api/members/${id}`);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <MembersContext.Provider value={{ members, loading, addMember, removeMember, refreshMembers }}>
      {children}
    </MembersContext.Provider>
  );
};
