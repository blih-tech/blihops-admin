'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import type { SidebarNavItem } from '@/lib/nav';

function hasActiveChild(item: SidebarNavItem, pathname: string): boolean {
  return item.items?.some((sub) => sub.url === pathname) ?? false;
}

export function NavMain({
  label,
  items,
}: {
  label: string;
  items: SidebarNavItem[];
}) {
  const pathname = usePathname();
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      items
        .filter(
          (item) =>
            item.items?.length &&
            (hasActiveChild(item, pathname) || item.isActive),
        )
        .map((item) => [item.title, true]),
    ),
  );
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenKeys((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const item of items) {
        if (
          item.items?.length &&
          hasActiveChild(item, pathname) &&
          !next[item.title]
        ) {
          next[item.title] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (!item.items?.length) {
            const isActive = item.url === pathname;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  render={<Link href={item.url ?? '#'} />}
                >
                  {item.icon ? <item.icon /> : null}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          const activeChild = hasActiveChild(item, pathname);
          return (
            <Collapsible
              key={item.title}
              open={openKeys[item.title] ?? false}
              onOpenChange={(open) =>
                setOpenKeys((prev) => ({ ...prev, [item.title]: open }))
              }
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={activeChild}
                  />
                }
              >
                {item.icon ? <item.icon /> : null}
                <span>{item.title}</span>
                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        isActive={subItem.url === pathname}
                        render={<Link href={subItem.url} />}
                      >
                        <span>{subItem.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
