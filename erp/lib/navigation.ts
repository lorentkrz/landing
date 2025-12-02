import { type LucideIcon, Home, Map, Users, QrCode, Coins, MessageSquare, Bell, FilePieChart, Settings2, Gift, BookOpen } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Overview", href: "/", icon: Home },
  { label: "Venues", href: "/venues", icon: Map },
  { label: "Users", href: "/users", icon: Users },
  { label: "Check-ins", href: "/check-ins", icon: QrCode },
  { label: "Credits", href: "/credits", icon: Coins },
  { label: "Referrals", href: "/referrals", icon: Gift },
  { label: "Guides", href: "/guides", icon: BookOpen },
  { label: "Conversations", href: "/conversations", icon: MessageSquare },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Accounting", href: "/accounting", icon: FilePieChart },
  { label: "Settings", href: "/settings", icon: Settings2 },
];
