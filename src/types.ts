export interface Salary {
  id?: string;
  person: string;
  amount: number;
  date: string;
  month: number;
  year: number;
}

export interface Expense {
  id?: string;
  title: string;
  amount: number;
  category: 'Food' | 'Rent' | 'Travel' | 'Shopping' | 'Bills' | 'Medical' | 'Other';
  paidBy: string;
  date: string;
  month: number;
  year: number;
  notes?: string;
}

export interface Investment {
  id?: string;
  type: 'Mutual Fund' | 'FD' | 'Stocks' | 'Gold' | 'Crypto' | 'Other';
  amount: number;
  owner: string;
  date: string;
  month: number;
  year: number;
  returnPercent?: number;
  notes?: string;
}

export interface OtherActivity {
  id?: string;
  title: string;
  amount: number;
  type: 'Income' | 'Gift' | 'Loan' | 'Transfer' | 'Other';
  person: string;
  date: string;
  month: number;
  year: number;
  notes?: string;
}

export interface Member {
  id: string;
  name: string;
  createdAt?: unknown;
}

export interface MonthData {
  salaries: Salary[];
  expenses: Expense[];
  investments: Investment[];
  activities: OtherActivity[];
}

export type ViewMode = 'month' | 'year';

export type ViewScope = 'household' | 'personal';

export interface FundGoal {
  enabled: boolean;
  target: number;
  current: number;
}

export interface Funds {
  emergency: FundGoal;
  vacation: FundGoal;
}

export interface AppContextType {
  currentMonth: number;
  currentYear: number;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  viewScope: ViewScope;
  setViewScope: (scope: ViewScope) => void;
  myMemberName: string;
  setMyMemberName: (name: string) => void;
  data: MonthData;
  filteredData: MonthData;
  refreshData: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  funds: Funds;
  refreshFunds: () => Promise<void>;
  updateFunds: (updates: Partial<Funds>) => Promise<void>;
}
