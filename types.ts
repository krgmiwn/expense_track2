
export type TransactionType = 'INCOME' | 'EXPENSE';
export type Frequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type AccountType = 'BANK' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'CARD';

export interface Account {
  id: AccountType;
  name: string;
  balance: number;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: TransactionType;
  accountId: AccountType;
  date: string;
  note: string;
}

export interface ScheduledTransaction {
  id: string;
  amount: number;
  category: string;
  type: TransactionType;
  accountId: AccountType;
  frequency: Frequency;
  startDate: string;
  lastProcessed?: string;
  note: string;
}

export interface UserProfile {
  name: string;
  email: string;
  currency: string;
  picture?: string;
  isAuthenticated?: boolean;
}

export interface AppState {
  transactions: Transaction[];
  scheduled: ScheduledTransaction[];
  profile: UserProfile;
  accounts: Account[];
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

export const CATEGORIES = {
  INCOME: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'],
  EXPENSE: ['Food', 'Rent', 'Transport', 'Utilities', 'Shopping', 'Entertainment', 'Health', 'Other']
};
