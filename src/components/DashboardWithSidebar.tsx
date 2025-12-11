import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Brain,
  LogOut,
  User,
  Settings,
  MessageSquare,
  FileText,
  Menu,
  X,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardWithSidebarProps {
  currentView: 'dashboard' | 'ai-interview' | 'resume-analyzer';
  onViewChange: (view: 'dashboard' | 'ai-interview' | 'resume-analyzer') => void;
  children: React.ReactNode;
}

const DashboardWithSidebar = ({ currentView, onViewChange, children }: DashboardWithSidebarProps) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigationItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & stats'
    },
    {
      id: 'ai-interview' as const,
      label: 'AI Interview',
      icon: MessageSquare,
      description: 'Practice interviews'
    },
    {
      id: 'resume-analyzer' as const,
      label: 'Resume Analyzer',
      icon: FileText,
      description: 'Analyze your resume'
    }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
        <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        
        {/* Floating Orbs */}
        <div className="fixed top-40 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="fixed bottom-20 left-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

        {/* Header */}
        <header className="sticky top-0 z-50 glass-card border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 hover:bg-card rounded-lg transition-colors"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                  <Brain className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold gradient-text">MockInterview AI</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-card">
                    <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center shadow-glow">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="hidden sm:inline text-foreground">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card border-border/50">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem className="focus:bg-card">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex relative z-10">
          {/* Sidebar */}
          <aside className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] 
            glass-card border-r border-border/50 p-4 transition-all duration-300 z-40
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarCollapsed ? 'w-20' : 'w-64'}
          `}>
            {/* Collapse Toggle - Desktop only */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-card border border-border/50 rounded-full items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shadow-md"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                const buttonContent = (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                      ${isActive 
                        ? 'gradient-primary text-primary-foreground shadow-glow' 
                        : 'hover:bg-card text-foreground'
                      }
                      ${sidebarCollapsed ? 'justify-center px-2' : ''}
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {item.description}
                        </p>
                      </div>
                    )}
                  </button>
                );

                if (sidebarCollapsed) {
                  return (
                    <Tooltip key={item.id} delayDuration={0}>
                      <TooltipTrigger asChild>
                        {buttonContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="glass-card border-border/50">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return buttonContent;
              })}
            </nav>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 lg:hidden z-30 top-16"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardWithSidebar;