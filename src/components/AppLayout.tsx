
import { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  showBack?: boolean;
  showNav?: boolean;
  showHeader?: boolean;
  showNotifications?: boolean;
  fullHeight?: boolean;
}

export function AppLayout({
  children,
  title,
  showBack = true,
  showNav = true,
  showHeader = true,
  showNotifications = true,
  fullHeight = false,
}: AppLayoutProps) {
  return (
    <div className={`${fullHeight ? 'h-screen' : 'min-h-screen'} flex flex-col bg-gray-50`}>
      {showHeader && (
        <PageHeader 
          title={title} 
          showBack={showBack} 
          showNotifications={showNotifications} 
        />
      )}
      
      <main className={`flex-1 ${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {showNav && <BottomNav />}
    </div>
  );
}
