'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

import { HeroForm } from './hero-form';
import { ServicesList } from './services-list';

type ServicesTab = 'hero' | 'services';

const TABS: { value: ServicesTab; label: string }[] = [
  { value: 'hero', label: 'Hero' },
  { value: 'services', label: 'Services' },
];

export function ServicesPage() {
  const [activeTab, setActiveTab] = useState<ServicesTab>('hero');

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center gap-1 self-start rounded-md border border-border bg-card p-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'cursor-pointer rounded-sm px-3 py-1.5 font-mono text-xs font-semibold transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'hero' ? <HeroForm /> : <ServicesList />}
    </div>
  );
}
