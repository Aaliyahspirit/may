
export interface TradeFormData {
  businessEmail: string;
  firstName: string;
  lastName: string;
  companyName: string;
  title: string;
  country: string;
  phone: string;
  streetAddress: string;
  aptSuite: string;
  city: string;
  state: string;
  zipCode: string;
  role: string;
  roleOther?: string;
  businessFocus: string;
  website: string;
  source: string;
  sourceOther?: string;
  referralEmail: string;
  message: string;
  agreeToTerms: boolean;
  subscribeToUpdates: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface DashboardData {
  user: {
    name: string;
    tier: 'General Customer' | 'Trade' | 'Trade Plus' | 'Trade Elite';
    points: number;
    vipStatus: string;
  };
  quarterlyProgress: {
    currentSpend: number;
    nextTierThreshold: number;
    currency: string;
    currentDiscount: number; // percentage
    discountCode: string;
  };
}