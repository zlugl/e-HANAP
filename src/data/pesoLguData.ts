import { LocalRecruitmentActivity, PesoReferralSlip } from '../types';

export const TESDA_CERTIFICATIONS_LIST = [
  "Shielded Metal Arc Welding (SMAW NC II)",
  "Electrical Installation & Maintenance (EIM NC II)",
  "Driving NC II",
  "Cookery NC II",
  "Bread & Pastry Production NC II",
  "Food & Beverage Services (FBS NC II)",
  "Housekeeping NC II",
  "Automotive Servicing NC II",
  "Heavy Equipment Operation (Backhoe/Forklift NC II)",
  "Agricultural Crop Production NC II",
  "Carpentry NC II",
  "Masonry NC II",
  "Plumbing NC II",
  "Tile Setting NC II",
  "Computer Systems Servicing (CSS NC II)",
  "Bookkeeping NC III",
  "Pharmacy Services NC II",
  "Caregiving NC II"
];

export const PRACTICAL_SKILLS_LIST = [
  "Welding & Steel Fabrication",
  "Electrical Wiring & Troubleshooting",
  "Light & Heavy Vehicle Driving",
  "Commercial Cooking & Food Preparation",
  "Baking & Pastry Making",
  "Table Service & Guest Hospitality",
  "Room Attendant & Housekeeping",
  "Small Engine & Motorcycle Repair",
  "Heavy Equipment Operation",
  "Crop Harvesting & Farm Operations",
  "Carpentry & Framework Construction",
  "Concrete Masonry & Plastering",
  "Plumbing & Pipefitting",
  "Tile Laying & Surface Finishing",
  "Hardware & PC Repair",
  "Inventory & Stock Handling",
  "Retail Cashiering & POS",
  "Customer Assistance & Frontline Care"
];

// Clean Zero-Data Initial States (Starting from scratch)
export const INITIAL_REFERRAL_SLIPS: PesoReferralSlip[] = [];
export const INITIAL_LRA_EVENTS: LocalRecruitmentActivity[] = [];
