export interface Shift {
  hasShift: boolean;
  startTime?: string;
  endTime?: string;
  employees?: number;
  hours?: number;
  date?: string;
}

export interface Customer {
  id: string;
  communityName: string;
  overview: string;
  customerType: string;
  referralSource: string;
  contractValidity: string;
  numberOfLocations: number;
  isSubLocation: boolean;
  parentLocation?: string[];
  email: string;
  primaryPhone: string;
  billingName: string;
  billingEmail: string;
  billingPhone: string;
  billingStreet1: string;
  billingStreet2: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  locationFull: string;
  locStreet1: string;
  locStreet2: string;
  locCity: string;
  locState: string;
  locZip: string;
  services: string[];
  startDate: string;
  endDate: string;
  notes: string;
  price1y: number;
  monthlyHours: number[];
  schedule: Record<string, Shift>;
  notionUrl?: string;
}

export const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

export const CUSTOMER_TYPES = [
  'Homeowners Association','Condominium','Apartment Complex','Hotel','Spa','Resort','Special Event','Waterpark','Management Company','Government Entity','Other'
];

export const REFERRAL_SOURCES = [
  'Google','Facebook','Website','Referral','Renewal','ChatGPT','Other'
];

export const CONTRACT_VALIDITY = ['Active','Signed','Expired'];

export const SERVICES = [
  'Pool Attendant',
  'Lifeguard',
  'Chemical Service',
  'Janitorial',
  'Front Desk',
  'Safety Inspection'
];
