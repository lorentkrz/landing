import type React from "react"
// User related types
export interface User {
id: string
firstName: string
lastName: string
avatar: string
country: string
city: string
bio?: string
age?: number
gender?: string
isOnline: boolean
lastActive?: string
}

// Venue related types
export interface Venue {
id: string
name: string
type: string
description?: string
address: string
city: string
distance?: string
rating: number
image: string
coverImage?: string
activeUsers: number
openHours?: string
features?: string[]
qrCode?: string
isCheckedIn?: boolean
}

// Message related types
export interface Message {
id: string
senderId: string
receiverId: string
text: string
timestamp: string
isRead: boolean
}

// Conversation related types
export interface Conversation {
id: string
user: User
lastMessage: string
time: string
unread: number
timeRemaining?: number
isActive: boolean
}

// Credit package related types
export interface CreditPackage {
id: string
name: string
credits: number
price: number
discount?: number
mostPopular?: boolean
}

// Check-in related types
export interface CheckIn {
id: string
venueId: string
userId: string
timestamp: string
expiresAt: string
}

// Navigation types
export type RootStackParamList = {
Home: undefined
Discover: undefined
Scan: undefined
Messages: undefined
Profile: undefined
VenueDetails: { venueId: string }
Chat: {
userId: string
userName: string
userAvatar: string
isNewChat?: boolean
conversationId?: string
}
Credits: undefined
Onboarding: undefined
Register: undefined
Login: undefined
CheckInConfirmation: { venueId: string; venueName: string }
UserProfile: { userId: string }
}

// Form related types
export interface RegisterFormData {
firstName: string
lastName: string
country: string
city: string
phoneOrEmail: string
password: string
confirmPassword: string
}

// Component prop types
export interface ButtonProps {
title: string
onPress: () => void
  style?: any
  textStyle?: any
  icon?: string
  iconPosition?: "left" | "right"
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

export interface HeaderProps {
  title: string
  showBackButton?: boolean
  rightComponent?: React.ReactNode
  onBackPress?: () => void
}

export interface VenueCardProps {
  venue: Venue
  onPress: () => void
}

export interface UserCardProps {
  user: User
  onPress: () => void
}

export interface ConversationItemProps {
  conversation: Conversation
  onPress: () => void
}

export interface TimerBarProps {
  duration: number
  onComplete?: () => void
}

export interface CreditPackageProps {
  pack: CreditPackage
  onSelect: (id: string) => void
  isSelected: boolean
}

export interface OnboardingSlideProps {
  title: string
  description: string
  image: string
  icon: string
}

export interface FormInputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  secureTextEntry?: boolean
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad"
  error?: string
  autoCapitalize?: "none" | "sentences" | "words" | "characters"
}
