import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { useLocation } from "wouter";
import { Menu, Bell, HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  
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
      default:
        return "Dashboard";
    }
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
            <div className="flex flex-1">
              <div className="flex w-full md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input
                    className="block w-full h-full py-2 pl-10 pr-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-transparent rounded-md focus:outline-none focus:bg-white focus:border-primary sm:text-sm"
                    placeholder="Search clients, projects..."
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center ml-4 md:ml-6">
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-1 text-gray-400 bg-white rounded-full hover:text-gray-500">
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="p-1 ml-3 text-gray-400 bg-white rounded-full hover:text-gray-500">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="relative flex-1 overflow-y-auto focus:outline-none bg-background">
          <div className="py-6">
            {/* Page Header */}
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
            </div>

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
