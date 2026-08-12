import {
  BotIcon,
  ChartColumnIcon,
  CodeIcon,
  DatabaseIcon,
  FilesIcon,
  GlobeIcon,
  HeadsetIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react';

import { serviceIcons, type ServiceIconKey } from '@/lib/api/content/services';

export { serviceIcons, type ServiceIconKey };

export const serviceIconRegistry: Record<ServiceIconKey, LucideIcon> = {
  headset: HeadsetIcon,
  files: FilesIcon,
  code: CodeIcon,
  bot: BotIcon,
  'chart-column': ChartColumnIcon,
  globe: GlobeIcon,
  'shield-check': ShieldCheckIcon,
  database: DatabaseIcon,
  users: UsersIcon,
  sparkles: SparklesIcon,
};

export function getServiceIcon(key: string): LucideIcon {
  return serviceIconRegistry[key as ServiceIconKey] ?? SparklesIcon;
}
