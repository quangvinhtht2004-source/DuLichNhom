export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  invite_code: string;
  created_by: string | null;
  created_at: string;
}

export type TripRole = 'LEADER' | 'MEMBER';

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripRole;
  joined_at: string;
  profile?: Profile;
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  day_number: number;
  time: string | null;
  title: string;
  location: string | null;
  note: string | null;
  order_index: number;
  created_at: string;
}

export type ExpenseCategory = 'FOOD' | 'TRANSPORT' | 'HOTEL' | 'SIGHTSEEING' | 'OTHER';
export type SplitType = 'EQUAL' | 'CUSTOM';

export interface Expense {
  id: string;
  trip_id: string;
  paid_by: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  split_type: SplitType;
  created_at: string;
  splits?: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount_owed: number;
}

export type SettlementStatus = 'PENDING' | 'PAID';

export interface Settlement {
  id: string;
  trip_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  status: SettlementStatus;
  paid_at: string | null;
  created_at: string;
}

export type ExpenseSettlement = Settlement;

export type ChecklistType = 'TODO' | 'PACKING';

export interface Checklist {
  id: string;
  trip_id: string;
  title: string;
  type: ChecklistType;
  assigned_to: string | null;
  is_completed: boolean;
  created_at: string;
}
