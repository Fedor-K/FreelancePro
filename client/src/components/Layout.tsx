import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { useLocation } from "wouter";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Check if this is an auth page
  const isAuthPage = location === "/auth";
  
  // Get page title based on current location
  const getPageTitle = () => {
    switch (location) {
      case "/clients":
        return "Clients";
      case "/projects":
        return "Projects";
      case "/resume":
        return "Resume Builder";
      case "/documents":
        return "Documents";
      case "/reports":
        return "Reports";
      case "/settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  // If it's the auth page, render without layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Top Navigation Header */}
        <div className="relative z-10 flex flex-shrink-0 h-16 bg-white shadow">
          <Button 
            variant="ghost" 
            size="icon" 
            className="px-4 text-gray-500 border-r border-gray-200 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex justify-between flex-1 px-4">
            {/* Removed search bar */}
            <div className="flex-1"></div>
            <div className="flex items-center ml-4 md:ml-6">
              {user && (
                <div className="flex items-center">
                  <span className="mr-4 text-sm font-medium text-gray-700">
                    {user.fullName || user.username}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="p-1 text-gray-400 bg-white rounded-full hover:text-gray-500"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              )}
              {/* Removed notification bell and help circle icons */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="relative flex-1 overflow-y-auto focus:outline-none bg-background">
          <div className="py-6">
            {/* Page Content */}
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
