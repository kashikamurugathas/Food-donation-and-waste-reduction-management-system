export type UserRole = 'donor' | 'institution' | 'admin';

export type FoodCategory =
  | 'Rice and Curry'
  | 'Vegetarian Meals'
  | 'Chicken Meals'
  | 'Snacks'
  | 'Fruits'
  | 'Bakery Items'
  | 'Other';

export type QuantityUnit = 'portions' | 'meal boxes' | 'kilograms';

export type StorageCondition =
  | 'Properly Hot-Held (>60°C)'
  | 'Refrigerated (<5°C)'
  | 'Ambient Covered / Freshly Prepared'
  | 'Insulated Food Carrier';

export type DonationStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Available'
  | 'Request Received'
  | 'Approved'
  | 'Ready for Collection'
  | 'Collected'
  | 'Delivered'
  | 'Expired'
  | 'Cancelled';

export type RequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Ready for Collection'
  | 'Collected'
  | 'Delivered'
  | 'Cancelled';

export type InstitutionType = "Children's Home" | "Elders' Home" | 'Care Centre';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  registeredDate: string;
  avatarUrl?: string;
}

export interface DonorProfile extends User {
  organizationType: 'Wedding Hall' | 'Hotel/Restaurant' | 'Catering Service' | 'Individual Host' | 'Bakery';
  address: string;
  area: string; // GN Division / Jaffna area
  district: string;
  contactPerson: string;
}

export interface InstitutionProfile extends User {
  institutionType: InstitutionType;
  registrationNumber: string;
  address: string;
  area: string; // Jaffna Area
  district: string;
  residentCount: number;
  dietaryPreferences: string[]; // e.g. 'Pure Vegetarian', 'Soft Food for Elders', 'Mild Spiced'
  operatingHours: string;
  contactPerson: string;
  latitude: number;
  longitude: number;
  needsDelivery: boolean;
  notes?: string;
}

export interface FoodDonation {
  id: string;
  donorId: string;
  donorName: string;
  donorType: string;
  foodName: string;
  category: FoodCategory;
  description: string;
  totalQuantity: number;
  remainingQuantity: number;
  unit: QuantityUnit;
  servesCount: number;
  eventName: string;
  venueName: string;
  pickupAddress: string;
  area: string; // Jaffna Area / GN Division
  district: string;
  latitude?: number;
  longitude?: number;
  preparedAt: string; // ISO String or readable
  safeCollectionDeadline: string; // ISO String
  storageCondition: StorageCondition;
  isVegetarian: boolean;
  allergenInfo: string;
  photos: string[];
  contactPerson: string;
  contactNumber: string;
  logisticsPreference: 'Pickup Only' | 'Delivery Available' | 'Flexible';
  specialInstructions: string;
  status: DonationStatus;
  createdAt: string;
  approvedRequestsCount?: number;
}

export interface FoodRequest {
  id: string;
  donationId: string;
  donationFoodName: string;
  donorId: string;
  donorName: string;
  institutionId: string;
  institutionName: string;
  institutionType: InstitutionType;
  requestedPortions: number;
  peopleToFeed: number;
  preferredTime: string;
  logisticsType: 'Self Pickup' | 'Request Delivery';
  dietaryRequirements: string;
  additionalNotes: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  collectionCompletedAt?: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string; // userId or 'all' or role
  title: string;
  message: string;
  type: 'info' | 'request' | 'approval' | 'rejection' | 'safety' | 'completed';
  linkTo?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ComplaintReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  targetType: 'Donation' | 'Institution' | 'Donor';
  targetId: string;
  targetTitle: string;
  reason: 'Unsafe Food Concern' | 'Inaccurate Listing Details' | 'Missed Collection' | 'Inappropriate Conduct' | 'Other';
  description: string;
  status: 'Investigating' | 'Resolved' | 'Dismissed';
  createdAt: string;
  adminNotes?: string;
}

export interface SmartMatchResult {
  institution: InstitutionProfile;
  distanceKm: number;
  suitabilityScore: number;
  reason: string;
  canServePortions: number;
  dietaryFit: boolean;
  timeBufferHours: number;
}
