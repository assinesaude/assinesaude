import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LogOut, 
  Home, 
  Search, 
  Package, 
  CreditCard, 
  Ticket, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Grid3X3, 
  FileText,
  Settings,
  ChevronLeft
} from 'lucide-react';
import logoAssinesaude from '@/assets/logo-assinesaude.png';

interface DashboardLayoutProps {
  children: ReactNode;
  userType: 'admin' | 'professional' | 'patient';
  userName?: string;
  userAvatar?: string | null;
  userSubtitle?: string;
}

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
}

const adminMenuItems: MenuItem[] = [
  { title: 'Pendentes', icon: Users, value: 'pending' },
  { title: 'Aprovados', icon: Users, value: 'approved' },
  { title: 'Profissões', icon: Briefcase, value: 'professions' },
  { title: 'Vetores', icon: Grid3X3, value: 'categories' },
  { title: 'Contratos', icon: FileText, value: 'contracts' },
  { title: 'Mensagens', icon: MessageSquare, value: 'messages' },
  { title: 'Cupons', icon: Ticket, value: 'coupons' },
  { title: 'Planos B2B', icon: Package, value: 'plans' },
];

const professionalMenuItems: MenuItem[] = [
  { title: 'Meus Programas', icon: Package, value: 'offerings' },
  { title: 'Meu Perfil', icon: Users, value: 'profile' },
  { title: 'Meus Cupons', icon: Ticket, value: 'coupons' },
  { title: 'Planos B2B', icon: CreditCard, value: 'plans' },
];

const patientMenuItems: MenuItem[] = [
  { title: 'Buscar Profissionais', icon: Search, value: 'search' },
  { title: 'Serviços', icon: Package, value: 'offerings' },
  { title: 'Minhas Assinaturas', icon: CreditCard, value: 'subscriptions' },
];

const SidebarContentComponent = ({ 
  userType, 
  userName, 
  userAvatar, 
  userSubtitle,
  activeTab,
  onTabChange,
  onLogout 
}: {
  userType: 'admin' | 'professional' | 'patient';
  userName?: string;
  userAvatar?: string | null;
  userSubtitle?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const menuItems = userType === 'admin' 
    ? adminMenuItems 
    : userType === 'professional' 
      ? professionalMenuItems 
      : patientMenuItems;

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'admin': return 'Administrador';
      case 'professional': return 'Profissional';
      case 'patient': return 'Paciente';
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img 
            src={logoAssinesaude} 
            alt="AssineSaúde" 
            className={isCollapsed ? "h-8" : "h-10"} 
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* User Profile Section */}
        <SidebarGroup>
          <div className={`flex items-center gap-3 px-3 py-4 ${isCollapsed ? 'justify-center' : ''}`}>
            <Avatar className={isCollapsed ? "h-8 w-8" : "h-12 w-12"}>
              <AvatarImage src={userAvatar || undefined} alt={userName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {userSubtitle || getUserTypeLabel()}
                </p>
              </div>
            )}
          </div>
        </SidebarGroup>

        {/* Menu Items */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    onClick={() => onTabChange(item.value)}
                    isActive={activeTab === item.value}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} tooltip="Sair">
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export const DashboardLayout = ({ 
  children, 
  userType, 
  userName, 
  userAvatar, 
  userSubtitle 
}: DashboardLayoutProps & { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
}) => {
  // This is a wrapper component that needs activeTab/onTabChange from parent
  return null;
};

interface DashboardWithSidebarProps {
  children: ReactNode;
  userType: 'admin' | 'professional' | 'patient';
  userName?: string;
  userAvatar?: string | null;
  userSubtitle?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const DashboardWithSidebar = ({ 
  children, 
  userType, 
  userName, 
  userAvatar, 
  userSubtitle,
  activeTab,
  onTabChange,
  onLogout
}: DashboardWithSidebarProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SidebarContentComponent
          userType={userType}
          userName={userName}
          userAvatar={userAvatar}
          userSubtitle={userSubtitle}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onLogout={onLogout}
        />
        <main className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-4 border-b border-border px-4 bg-card">
            <SidebarTrigger />
            <div className="flex-1" />
          </header>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardWithSidebar;
