import {
  BadgeCheckIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  CalendarClockIcon,
  CircleHelpIcon,
  ClapperboardIcon,
  FolderOpenIcon,
  FolderTreeIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  MailIcon,
  MessageSquareQuoteIcon,
  TagIcon,
  UserCheckIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react';

export interface SidebarNavItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: { title: string; url: string }[];
}

export const operationsNav: SidebarNavItem[] = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboardIcon },
  { title: 'Leads', url: '/leads', icon: UsersIcon },
  { title: 'Companies', url: '/companies', icon: Building2Icon },
  {
    title: 'Talent',
    url: '/talent',
    icon: UserCheckIcon,
    items: [
      { title: 'Applications', url: '/talent/applications' },
      { title: 'Profiles', url: '/talent/profiles' },
    ],
  },
];

export const contentNav: SidebarNavItem[] = [
  { title: 'Logos', url: '/content/logos', icon: BadgeCheckIcon },
  {
    title: 'Testimonials',
    url: '/content/testimonials',
    icon: MessageSquareQuoteIcon,
  },
  {
    title: 'Services',
    url: '/content/services',
    icon: ClapperboardIcon,
  },
  { title: 'Case Studies', url: '/content/case-studies', icon: FolderOpenIcon },
  { title: 'Insights', url: '/content/insights', icon: LightbulbIcon },
  { title: 'Careers', url: '/content/careers', icon: BriefcaseBusinessIcon },
  { title: 'FAQs', url: '/content/faqs', icon: CircleHelpIcon },
  { title: 'Categories', url: '/content/categories', icon: FolderTreeIcon },
  { title: 'Tags', url: '/content/tags', icon: TagIcon },
];

export const settingsNav: SidebarNavItem[] = [
  {
    title: 'Email Templates',
    url: '/settings/email-templates',
    icon: MailIcon,
  },
  { title: 'Cal.com', url: '/settings/cal-com', icon: CalendarClockIcon },
];

export function navLabel(pathname: string): string | null {
  if (pathname === '/') {
    return 'Dashboard';
  }

  for (const group of [operationsNav, contentNav, settingsNav]) {
    for (const item of group) {
      if (item.url === pathname) {
        return item.title;
      }
      for (const child of item.items ?? []) {
        if (child.url === pathname) {
          return `${item.title} / ${child.title}`;
        }
      }
    }
  }

  return null;
}
