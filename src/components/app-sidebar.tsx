'use client';

import Image from 'next/image';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { contentNav, operationsNav, settingsNav } from '@/lib/nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-10 items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Image
            src="/logo-blihops.png"
            alt="BlihOps"
            width={1416}
            height={410}
            priority
            className="h-8 w-auto object-contain group-data-[collapsible=icon]:hidden"
          />
          <Image
            src="/icon.png"
            alt="BlihOps"
            width={512}
            height={512}
            className="hidden size-8 object-contain group-data-[collapsible=icon]:block"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Operations" items={operationsNav} />
        <NavMain label="Content" items={contentNav} />
        <NavMain label="Settings" items={settingsNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
