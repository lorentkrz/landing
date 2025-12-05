import type React from "react";

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Scan: undefined;
  Messages: undefined;
  Profile: undefined;
};

// User related types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  email?: string;
  country?: string;
  city?: string;
  bio?: string;
  age?: number;
  gender?: string;
  birthdate?: string;
  isOnline: boolean;
  lastActive?: string;
}

// Venue related types
export interface Venue {
  id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  city: string;
  country: string;
  distance?: string;
  distanceKm?: number;
  rating: number;
  image: string;
  coverImage?: string;
  activeUsers: number;
  openHours?: string;
  features?: string[];
  qrCode?: string;
  isCheckedIn?: boolean;
  capacity?: number;
  updatedAt?: string;
  latitude?: number;
  longitude?: number;
  mapVisible?: boolean;
  isFeatured?: boolean;
}

// Message related types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

// Conversation related types
export interface Conversation {
  id: string;
  user: User;
  lastMessage: string;
  time: string;
  unread: number;
  timeRemaining?: number;
  isActive: boolean;
}

export interface ConnectionRequest {
  id: string;
  user: User;
  message: string;
  sentAt: string;
  status?: "pending" | "accepted" | "declined";
}

// Credit package related types
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  discount?: number;
  mostPopular?: boolean;
}

export interface CreditTransaction {
  id: string;
  userId?: string;
  amount: number;
  price: number;
  type: "purchase" | "debit";
  date: string;
  description?: string;
}

export interface Referral {
  id: string;
  code: string;
  status: "pending" | "joined" | "rewarded" | "revoked";
  inviteeContact?: string;
  inviteeId?: string;
  rewardInviterCredits: number;
  rewardInviteeCredits: number;
  createdAt: string;
  joinedAt?: string;
  rewardedAt?: string;
}

export interface Story {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType?: "image" | "video";
  durationMs?: number;
  venueId?: string;
  createdAt: string;
  expiresAt: string;
  views?: number;
  isOwn?: boolean;
  seenAt?: string;
  status?: "live" | "expired" | "failed";
  deepLink?: string;
  retryCount?: number;
  errorReason?: string;
}

// Check-in related types
export interface CheckIn {
  id: string;
  venueId: string;
  userId: string;
  timestamp: string;
  expiresAt: string;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Discover: undefined;
  Scan: undefined;
  Messages: undefined;
  Profile: undefined;
  MainTabs: undefined;
  VenueDetails: { venueId: string };
  VenueRoom: { venueId: string };
  Map: undefined;
  Contacts: undefined;
  Requests: undefined;
  NewMessage: undefined;
  Chat: {
    conversationId: string;
    userId: string;
    userName: string;
    userAvatar: string;
  };
  Credits: undefined;
  Onboarding: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  Login: undefined;
  ForgotPassword: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  HelpCenter: undefined;
  About: undefined;
  CheckInConfirmation: { venueId: string; venueName: string };
  UserProfile: { userId: string };
  HowToCheckIn: undefined;
  AuthCallback: undefined;
  ResetPassword: { email?: string };
};

// Form related types
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  phoneOrEmail: string;
  password: string;
  confirmPassword: string;
}

// Component prop types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: any;
  textStyle?: any;
  icon?: string;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
}

export interface VenueCardProps {
  venue: Venue;
  onPress: () => void;
}

export interface UserCardProps {
  user: User;
  onPress: () => void;
}

export interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export interface TimerBarProps {
  duration: number;
  onComplete?: () => void;
}

export interface CreditPackageProps {
  pack: CreditPackage;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export interface OnboardingSlideProps {
  title: string;
  description: string;
  image: string;
  icon: string;
}

export interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  error?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}
