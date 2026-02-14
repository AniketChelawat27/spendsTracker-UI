import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import type { AppContextType, MonthData, ViewMode, ViewScope, Funds } from './types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const defaultFunds: Funds = {
  emergency: { enabled: false, target: 0, current: 0 },
  vacation: { enabled: false, target: 0, current: 0 }
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('viewMode');
    return (saved === 'year' ? 'year' : 'month') as ViewMode;
  });
  const [viewScope, setViewScope] = useState<ViewScope>(() => {
    const saved = localStorage.getItem('viewScope');
    return (saved === 'personal' ? 'personal' : 'household') as ViewScope;
  });
  const [myMemberName, setMyMemberNameState] = useState(() => localStorage.getItem('myMemberName') || '');
  const [data, setData] = useState<MonthData>({
    salaries: [],
    expenses: [],
    investments: [],
    activities: []
  });
  const [funds, setFunds] = useState<Funds>(defaultFunds);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const setMyMemberName = useCallback((name: string) => {
    setMyMemberNameState(name);
    localStorage.setItem('myMemberName', name);
  }, []);

  const filteredData = useMemo(() => {
    if (viewScope !== 'personal' || !myMemberName) return data;
    return {
      salaries: data.salaries.filter((s) => s.person === myMemberName),
      expenses: data.expenses.filter((e) => e.paidBy === myMemberName),
      investments: data.investments.filter((i) => i.owner === myMemberName),
      activities: data.activities.filter((a) => a.person === myMemberName)
    };
  }, [data, viewScope, myMemberName]);

  const refreshData = useCallback(async () => {
    try {
      if (viewMode === 'year') {
        const response = await axios.get(`/api/data/year/${currentYear}`);
        setData(response.data);
      } else {
        const response = await axios.get(`/api/data/${currentYear}/${currentMonth}`);
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [viewMode, currentYear, currentMonth]);

  const refreshFunds = useCallback(async () => {
    try {
      const response = await axios.get<Funds>('/api/funds');
      setFunds(response.data);
    } catch (error) {
      console.error('Error fetching funds:', error);
    }
  }, []);

  const updateFunds = useCallback(async (updates: Partial<Funds>) => {
    try {
      const next = {
        emergency: updates.emergency ?? funds.emergency,
        vacation: updates.vacation ?? funds.vacation
      };
      await axios.put('/api/funds', next);
      setFunds(next);
    } catch (error) {
      console.error('Error updating funds:', error);
      throw error;
    }
  }, [funds.emergency, funds.vacation]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    refreshFunds();
  }, [refreshFunds]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('viewScope', viewScope);
  }, [viewScope]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <AppContext.Provider
      value={{
        currentMonth,
        currentYear,
        setCurrentMonth,
        setCurrentYear,
        viewMode,
        setViewMode,
        viewScope,
        setViewScope,
        myMemberName,
        setMyMemberName,
        data,
        filteredData,
        refreshData,
        isDarkMode,
        toggleDarkMode,
        funds,
        refreshFunds,
        updateFunds
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
