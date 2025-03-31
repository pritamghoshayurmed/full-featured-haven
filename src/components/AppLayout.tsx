import { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { DoctorBottomNav } from "@/components/DoctorBottomNav";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";
  
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
      
      {showNav && (
        isDoctor ? <DoctorBottomNav /> : <BottomNav />
      )}
    </div>
  );
}
