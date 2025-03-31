import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  User, 
  UserPlus, 
  Brain, 
  Menu, 
  X,
  BarChart,
  FileText,
  DollarSign 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/user';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: user?.role === UserRole.DOCTOR ? '/doctor/dashboard' : '/dashboard',
      icon: <Home size={20} />,
      roles: [UserRole.PATIENT, UserRole.DOCTOR]
    },
    {
      name: 'Appointments',
      path: user?.role === UserRole.DOCTOR ? '/doctor/appointments' : '/appointments',
      icon: <Calendar size={20} />,
      roles: [UserRole.PATIENT, UserRole.DOCTOR]
    },
    {
      name: 'Chat',
      path: user?.role === UserRole.DOCTOR ? '/doctor/chat' : '/chat',
      icon: <MessageSquare size={20} />,
      roles: [UserRole.PATIENT, UserRole.DOCTOR]
    },
    {
      name: 'AI Assistant',
      path: '/ai',
      icon: <Brain size={20} />,
      roles: [UserRole.PATIENT]
    },
    {
      name: 'Doctor AI Insights',
      path: '/doctor/ai-assistant',
      icon: <Brain size={20} />,
      roles: [UserRole.DOCTOR]
    },
    {
      name: 'Find Doctors',
      path: '/doctors',
      icon: <UserPlus size={20} />,
      roles: [UserRole.PATIENT]
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User size={20} />,
      roles: [UserRole.PATIENT, UserRole.DOCTOR]
    },
    {
      name: 'Patient Records',
      path: '/doctor/patients',
      icon: <FileText size={20} />,
      roles: [UserRole.DOCTOR]
    },
    {
      name: 'Analytics',
      path: '/doctor/analytics',
      icon: <BarChart size={20} />,
      roles: [UserRole.DOCTOR]
    },
    {
      name: 'Earnings',
      path: '/doctor/earnings',
      icon: <DollarSign size={20} />,
      roles: [UserRole.DOCTOR]
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role as UserRole)
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {/* Sidebar */}
      <div 
        className={cn(
          "w-64 bg-background border-r h-full flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out fixed md:relative z-40 top-0 left-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">HealthCare Haven</h2>
          <p className="text-sm text-muted-foreground">
            {user?.role === UserRole.DOCTOR ? 'Doctor Portal' : 'Patient Portal'}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 