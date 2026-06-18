
export type Member = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  totalContributions: number;
  joinDate: string;
  status: 'active' | 'pending';
};

export type Loan = {
  id: string;
  memberId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'repaid' | 'overdue';
  requestDate: string;
  dueDate?: string;
  interestRate: number;
  termMonths: number;
  purpose: string;
};

export type Contribution = {
  id: string;
  memberId: string;
  amount: number;
  date: string;
};

export const MOCK_MEMBERS: Member[] = [
  { id: 'm1', name: 'John Doe', email: 'john@example.com', role: 'member', totalContributions: 5000, joinDate: '2023-01-15', status: 'active' },
  { id: 'm2', name: 'Jane Smith', email: 'jane@example.com', role: 'member', totalContributions: 12000, joinDate: '2022-06-20', status: 'active' },
  { id: 'm3', name: 'Bob Wilson', email: 'bob@example.com', role: 'member', totalContributions: 3500, joinDate: '2023-11-02', status: 'active' },
  { id: 'm4', name: 'Alice Guo', email: 'alice@example.com', role: 'member', totalContributions: 0, joinDate: '2024-03-10', status: 'pending' },
  { id: 'a1', name: 'Admin User', email: 'admin@daryloan.com', role: 'admin', totalContributions: 0, joinDate: '2021-01-01', status: 'active' },
];

export const MOCK_LOANS: Loan[] = [
  { id: 'l1', memberId: 'm1', amount: 2000, status: 'approved', requestDate: '2024-02-10', dueDate: '2024-04-10', interestRate: 0.05, termMonths: 12, purpose: 'Home Repair' },
  { id: 'l2', memberId: 'm2', amount: 15000, status: 'pending', requestDate: '2024-03-01', interestRate: 0.04, termMonths: 24, purpose: 'Education' },
  { id: 'l3', memberId: 'm3', amount: 500, status: 'rejected', requestDate: '2024-01-15', interestRate: 0.08, termMonths: 6, purpose: 'Emergency' },
  { id: 'l4', memberId: 'm2', amount: 5000, status: 'overdue', requestDate: '2023-12-01', dueDate: '2024-03-01', interestRate: 0.05, termMonths: 12, purpose: 'Business Capital' },
];

export const MOCK_CONTRIBUTIONS: Contribution[] = [
  { id: 'c1', memberId: 'm1', amount: 500, date: '2024-01-15' },
  { id: 'c2', memberId: 'm1', amount: 500, date: '2024-02-15' },
  { id: 'c3', memberId: 'm2', amount: 1000, date: '2024-01-20' },
  { id: 'c4', memberId: 'm2', amount: 1000, date: '2024-02-20' },
  { id: 'c5', memberId: 'm3', amount: 200, date: '2024-02-25' },
];
