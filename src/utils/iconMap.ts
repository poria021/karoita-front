import {
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Users,
  Building2,
  Map,
  MapPin,
  School,
  Briefcase,
  ShieldUser,
  LayoutDashboard,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Plus,
  Trash2,
  Edit,
  type LucideIcon
} from 'lucide-react';

/**
 * Global FontAwesome-to-Lucide icon mapper.
 * 
 * Complies with Rule 10 (Strict TypeScript - No 'any' used) and Rule 30.
 * Used primarily by dynamic navigation layouts to resolve legacy icon strings.
 */
export const iconMap: Record<string, LucideIcon> = {
  'fa-graduation-cap': GraduationCap,
  'fa-clipboard-check': ClipboardCheck,
  'fa-user-group': Users,
  'fa-school': School,
  'fa-map': Map,
  'fa-map-location-dot': MapPin,
  'fa-user-tie': Briefcase,
  'fa-user-shield': ShieldUser,
  'fa-home': LayoutDashboard,
  'fa-sliders': Settings,
  'fa-power-off': LogOut,
  'fa-bell': Bell,
  'fa-chevron-down': ChevronDown,
  'fa-plus': Plus,
  'fa-trash-can': Trash2,
  'fa-pen-to-square': Edit,
  'fa-book-open': BookOpen,
  'fa-building-columns': Building2,
};