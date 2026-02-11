
export type TransactionType = 'INCOME' | 'EXPENSE';
export type Frequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;
  note: string;
}

export interface ScheduledTransaction {
  id: string;
  amount: number;
  category: string;
  type: TransactionType;
  frequency: Frequency;
  startDate: string;
  lastProcessed?: string;
  note: string;
}

export interface UserProfile {
  name: string;
  email: string;
  currency: string;
}

export interface AppState {
  transactions: Transaction[];
  scheduled: ScheduledTransaction[];
  profile: UserProfile;
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
