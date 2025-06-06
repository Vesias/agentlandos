/**
 * Enhanced Service Types for AGENTLAND.SAARLAND
 * Real-time monitoring, cross-border coordination, premium features
 */

export type ServiceCategory = 'verwaltung' | 'tourismus' | 'wirtschaft' | 'bildung' | 'kultur' | 'gesundheit';
export type ServicePriority = 'low' | 'normal' | 'high' | 'urgent';
export type SupportedLanguage = 'de' | 'fr' | 'en';
export type ProviderType = 'municipal' | 'state' | 'federal' | 'private' | 'eu';

export interface SaarlandService {
  id: string;
  name: string;
  category: ServiceCategory;
  subcategory: string;
  description: string;
  provider: ServiceProvider;
  location: ServiceLocation;
  availability: ServiceAvailability;
  requirements: ServiceRequirement[];
  fees: ServiceFee[];
  processingTime: ProcessingTime;
  digitalOptions: DigitalOptions;
  crossBorder: CrossBorderInfo;
  languages: SupportedLanguage[];
  accessibility: AccessibilityInfo;
  lastUpdated: string;
  isPremium: boolean;
  realTimeData?: RealTimeServiceData;
}

export interface ServiceProvider {
  name: string;
  type: ProviderType;
  contact: {
    address: string;
    phone: string;
    email: string;
    website: string;
    emergencyContact?: string;
  };
  operatingEntity: string;
  licenseNumber?: string;
  certifications: string[];
}

export interface ServiceLocation {
  lat: number;
  lng: number;
  address: string;
  municipality: string;
  postcode: string;
  district: string;
  accessibilityFeatures: string[];
  parkingAvailable: boolean;
  publicTransportAccess: {
    nearestStop: string;
    lines: string[];
    walkingTime: number;
  };
}

export interface RealTimeServiceData {
  currentQueue: number;
  estimatedWaitTime: string;
  nextAvailableSlot?: string;
  temporaryClosures: TemporaryClosure[];
  specialNotices: string[];
  onlineAvailability: boolean;
  capacity: {
    current: number;
    maximum: number;
    percentage: number;
  };
  staffingLevel: 'full' | 'reduced' | 'minimal';
  lastUpdated: string;
}

export interface TemporaryClosure {
  reason: string;
  startDate: string;
  endDate: string;
  alternativeService?: string;
  isEmergency: boolean;
}

export interface CrossBorderInfo {
  available: boolean;
  supportedCountries: ('DE' | 'FR' | 'LU')[];
  equivalentServices: EquivalentService[];
  treatyReferences: string[];
  processingLocation: 'local' | 'cross_border_center' | 'digital' | 'multiple';
  additionalRequirements: string[];
  coordinationRequired: boolean;
}

export interface EquivalentService {
  country: 'DE' | 'FR' | 'LU';
  serviceName: string;
  provider: string;
  additionalRequirements: string[];
  processingTime: string;
  costs: ServiceFee[];
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
}

export interface ServiceAvailability {
  online: boolean;
  inPerson: boolean;
  phone: boolean;
  hours: {
    [key: string]: string; // monday: "08:00-16:00"
  };
  specialHours: {
    date: string;
    hours: string;
    reason: string;
  }[];
  appointmentRequired: boolean;
  walkInAccepted: boolean;
  emergencyAvailable: boolean;
}

export interface ServiceRequirement {
  type: 'document' | 'prerequisite' | 'qualification' | 'citizenship';
  name: string;
  description: string;
  mandatory: boolean;
  alternatives: string[];
  validityPeriod?: string;
  obtainableOnline: boolean;
  crossBorderValid: boolean;
}

export interface ServiceFee {
  type: 'processing' | 'expedited' | 'certification' | 'consultation';
  amount: number;
  currency: 'EUR';
  description: string;
  paymentMethods: ('cash' | 'card' | 'bank_transfer' | 'online')[];
  waiverConditions: string[];
  premiumDiscount?: number;
}

export interface ProcessingTime {
  standard: string;
  expedited?: string;
  premium?: string;
  factors: string[];
  seasonalVariation: boolean;
}

export interface DigitalOptions {
  onlineApplication: boolean;
  statusChecking: boolean;
  documentUpload: boolean;
  videoConsultation: boolean;
  digitalSignature: boolean;
  mobileApp: boolean;
  apiAccess: boolean;
}

export interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  hearingImpaired: boolean;
  visuallyImpaired: boolean;
  signLanguage: boolean;
  multilingual: boolean;
  assistanceAvailable: boolean;
}

// Cross-border coordination types
export interface CoordinationPlan {
  id: string;
  serviceType: string;
  countries: string[];
  steps: CoordinationStep[];
  estimatedDuration: string;
  totalFees: number;
  requiredDocuments: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  riskFactors: string[];
  timeline: TimelineEvent[];
}

export interface CoordinationStep {
  stepNumber: number;
  title: string;
  description: string;
  location: string;
  country: string;
  duration: string;
  fee?: number;
  requirements: string[];
  digitalOption: boolean;
  contactPerson?: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface TimelineEvent {
  date: string;
  event: string;
  location: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
}

// Premium service types
export interface ConciergeSession {
  id: string;
  userId: string;
  serviceRequest: ServiceRequest;
  advisor: PersonalAdvisor;
  priority: ServicePriority;
  status: 'active' | 'completed' | 'cancelled';
  timeline: string;
  immediateActions: string[];
  communicationChannels: CommunicationChannels;
  createdAt: string;
  completedAt?: string;
}

export interface ServiceRequest {
  category: ServiceCategory;
  description: string;
  urgency: ServicePriority;
  preferredLanguage: SupportedLanguage;
  crossBorderNeeded: boolean;
  documentsAvailable: string[];
  constraints: {
    timeframe?: string;
    budget?: number;
    location?: string;
  };
}

export interface PersonalAdvisor {
  id: string;
  name: string;
  specializations: ServiceCategory[];
  languages: SupportedLanguage[];
  experience: number;
  rating: number;
  availability: {
    nextSlot: string;
    timezone: string;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
    calendarLink: string;
  };
}

export interface CommunicationChannels {
  phone: string;
  email: string;
  whatsapp?: string;
  videoCall: string;
  instantMessaging: boolean;
  emergencyContact: string;
}

// AI assistance types
export interface ServiceAnalysis {
  primaryService: string;
  alternativeServices: string[];
  requiredDocuments: string[];
  estimatedTime: string;
  estimatedCost: string;
  digitalOptions: boolean;
  premiumBenefits: string[];
  crossBorderConsiderations: string;
  nextSteps: string[];
  confidenceScore: number;
  reasoning: string;
}

export interface RoutingDecision {
  primaryService: SaarlandService;
  alternativeServices: SaarlandService[];
  reasoning: string;
  confidenceScore: number;
  estimatedSatisfaction: number;
  premiumUpgrade: {
    available: boolean;
    benefits: string[];
    additionalCost: number;
  };
}

// User context and preferences
export interface UserContext {
  location?: {
    lat: number;
    lng: number;
    municipality: string;
  };
  preferredLanguage: SupportedLanguage;
  isPremium: boolean;
  citizenship: string;
  residence: string;
  accessibilityNeeds: string[];
  serviceHistory: ServiceHistory[];
}

export interface ServiceHistory {
  serviceId: string;
  category: ServiceCategory;
  completedAt: string;
  satisfaction: number;
  processingTime: string;
  issues: string[];
  premiumUsed: boolean;
}

export interface PersonalizedRecommendations {
  services: SaarlandService[];
  reasoning: string[];
  timeOptimized: boolean;
  costOptimized: boolean;
  premiumRecommended: boolean;
  crossBorderOpportunities: string[];
}