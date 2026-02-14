import React, { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { AppProvider } from './AppContext';
import { MembersProvider } from './MembersContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SalarySection } from './components/SalarySection';
import { ExpenseSection } from './components/ExpenseSection';
import { InvestmentSection } from './components/InvestmentSection';
import { OtherActivitiesSection } from './components/OtherActivitiesSection';
import { MembersSection } from './components/MembersSection';
import { SpendsSliderSection } from './components/SpendsSliderSection';
import { AuthScreen } from './components/AuthScreen';
import {
  LayoutDashboard,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Activity,
  Users,
  Loader2,
  ChevronRight,
  X,
  LayoutGrid,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';
import { useApp } from './AppContext';

type Tab = 'dashboard' | 'salary' | 'expenses' | 'spends' | 'investments' | 'activities' | 'household';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'salary', label: 'Salary', icon: DollarSign },
  { id: 'expenses', label: 'Expenses', icon: ShoppingBag },
  { id: 'spends', label: 'Spends', icon: LayoutGrid },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'household', label: 'Household', icon: Users },
];

function NavContent({
  activeTab,
  setActiveTab,
  onNavigate,
}: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  onNavigate?: () => void;
}) {
  const handleTab = (tab: Tab) => {
    setActiveTab(tab);
    onNavigate?.();
  };
  return (
    <>
      <div className="p-4 sm:p-5 border-b border-border dark:border-border-dark">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-clay-black dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-bold shadow-soft flex-shrink-0">
            ₹
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-neutral-900 dark:text-white tracking-tight truncate">Spend Tracker</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Finance, simplified</p>
          </div>
        </div>
      </div>
      <nav className="p-3 flex-1 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTab(tab.id)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-medium transition-all duration-200 min-h-[44px] touch-manipulation active:scale-[0.98] ${
                isActive
                  ? 'bg-primary-500/12 text-primary-700 dark:text-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 active:bg-neutral-100 dark:active:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                <span className="truncate">{tab.label}</span>
              </span>
              {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0 text-primary-600 dark:text-primary-400" />}
            </button>
          );
        })}
      </nav>
    </>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeDrawer = useCallback(() => setSidebarOpen(false), []);
  const { isDarkMode, toggleDarkMode } = useApp();
  const { user, signOut } = useAuth();

  const handleSignOut = useCallback(() => {
    closeDrawer();
    signOut();
  }, [closeDrawer, signOut]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-surface dark:bg-surface-dark flex">
      <aside className="hidden lg:flex w-60 min-h-screen border-r border-border dark:border-border-dark bg-white dark:bg-neutral-900/50 flex-col flex-shrink-0">
        <NavContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={closeDrawer}
          onKeyDown={(e) => e.key === 'Escape' && closeDrawer()}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-[280px] max-w-[85vw] bg-white dark:bg-neutral-900 border-r border-border dark:border-border-dark flex flex-col shadow-float-lg transform transition-transform duration-300 ease-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-border-dark">
          <span className="font-semibold text-neutral-800 dark:text-neutral-100">Menu</span>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-2.5 -mr-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <NavContent activeTab={activeTab} setActiveTab={setActiveTab} onNavigate={closeDrawer} />
        <div className="p-3 pt-2 mt-auto border-t border-border dark:border-border-dark space-y-1" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
          <button
            type="button"
            onClick={() => toggleDarkMode()}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 min-h-[44px] touch-manipulation"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <span className="block px-4 py-2 text-xs text-neutral-500 dark:text-neutral-400 truncate" title={user?.email ?? ''}>
            {user?.email ?? ''}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-red-600 dark:hover:text-red-400 min-h-[44px] touch-manipulation"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-auto overflow-x-hidden">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'salary' && <SalarySection />}
          {activeTab === 'expenses' && <ExpenseSection />}
          {activeTab === 'spends' && <SpendsSliderSection />}
          {activeTab === 'investments' && <InvestmentSection />}
          {activeTab === 'activities' && <OtherActivitiesSection />}
          {activeTab === 'household' && <MembersSection />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}

function AppGate() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-surface-dark flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <AuthScreen />;
  }
  return (
    <AppProvider>
      <MembersProvider>
        <AppContent />
      </MembersProvider>
    </AppProvider>
  );
}

export default App;
